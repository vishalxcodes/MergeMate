from flask import Flask, request, send_file
from pdf2docx import Converter
import os
import uuid
import tempfile
import pdfplumber
import openpyxl
from openpyxl.styles import Font, Border, Side, PatternFill
from openpyxl.utils import get_column_letter
import fitz
import gc
from pptx import Presentation
from pptx.util import Inches, Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from PIL import Image
import io


app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return {"status": "up"}


@app.route("/convert", methods=["POST"])
def convert():
    file = request.files["file"]
    temp_dir = tempfile.gettempdir()
    input_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    output_path = os.path.join(temp_dir, f"{uuid.uuid4()}.docx")

    file.save(input_path)

    cv = Converter(input_path)
    cv.convert(output_path)
    cv.close()

    os.remove(input_path)

    return send_file(output_path, as_attachment=True, download_name="converted.docx")


@app.route("/convert-to-excel", methods=["POST"])
def convert_to_excel():
    file = request.files["file"]
    temp_dir = tempfile.gettempdir()
    input_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    output_path = os.path.join(temp_dir, f"{uuid.uuid4()}.xlsx")

    file.save(input_path)

    workbook = openpyxl.Workbook()
    workbook.remove(workbook.active)

    def try_number(value):
        if value is None:
            return None
        cleaned = str(value).replace(",", "").strip()
        try:
            if "." in cleaned:
                return float(cleaned)
            return int(cleaned)
        except ValueError:
            return value

    thin = Side(style="thin", color="999999")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    header_fill = PatternFill(start_color="D9E1F2", end_color="D9E1F2", fill_type="solid")

    page_count = 0

    with pdfplumber.open(input_path) as pdf:
        for page in pdf.pages:
            table_objects = page.find_tables()
            table_rows_list = page.extract_tables()

            if not table_objects or not table_rows_list:
                continue

            page_count += 1
            sheet = workbook.create_sheet(f"Page {page_count}")

            words = page.extract_words()

            table_line_texts = set()
            blocks = []
            table_bboxes = []

            paired = list(zip(table_objects, table_rows_list))

            for t_obj, rows in paired:
                for row in rows:
                    line_text = " ".join(str(c) for c in row if c).strip()
                    if line_text:
                        table_line_texts.add(line_text)
                blocks.append({
                    "type": "table",
                    "top": t_obj.bbox[1],
                    "rows": rows,
                })
                table_bboxes.append((t_obj.bbox[1], t_obj.bbox[3]))

            lines_by_top = {}
            for w in words:
                key = round(w["top"] / 3) * 3
                lines_by_top.setdefault(key, []).append(w["text"])

            for top, word_list in lines_by_top.items():
                line_text = " ".join(word_list).strip()
                if not line_text:
                    continue
                if line_text in table_line_texts:
                    continue

                inside_table = False
                for top_bound, bottom_bound in table_bboxes:
                    if top_bound - 2 <= top <= bottom_bound + 2:
                        inside_table = True
                        break

                if inside_table:
                    continue

                blocks.append({
                    "type": "text",
                    "top": top,
                    "text": line_text,
                })

            blocks.sort(key=lambda b: b["top"])

            current_row = 1
            width_tracker = {}
            max_cols_seen = 1
            heading_rows = []

            for block in blocks:
                if block["type"] == "text":
                    sheet.cell(row=current_row, column=1, value=block["text"])
                    sheet.cell(row=current_row, column=1).font = Font(bold=True, size=11)
                    heading_rows.append(current_row)
                    current_row += 1

                else:
                    rows = block["rows"]
                    header_row = current_row
                    num_cols = len(rows[0]) if rows else 1
                    max_cols_seen = max(max_cols_seen, num_cols)

                    for row in rows:
                        converted_row = [try_number(cell) for cell in row]
                        for col_index, value in enumerate(converted_row, start=1):
                            cell = sheet.cell(row=current_row, column=col_index, value=value)
                            cell.border = border

                            text_len = len(str(value)) if value is not None else 0
                            width_tracker[col_index] = max(width_tracker.get(col_index, 0), text_len)

                        current_row += 1

                    for col_index in range(1, num_cols + 1):
                        header_cell = sheet.cell(row=header_row, column=col_index)
                        header_cell.font = Font(bold=True)
                        header_cell.fill = header_fill

                    current_row += 1

            for row_num in heading_rows:
                sheet.merge_cells(
                    start_row=row_num, start_column=1,
                    end_row=row_num, end_column=max(max_cols_seen, 1)
                )

            for col_index, width in width_tracker.items():
                col_letter = get_column_letter(col_index)
                sheet.column_dimensions[col_letter].width = min(width + 4, 40)

    if len(workbook.sheetnames) == 0:
        workbook.create_sheet("Sheet1")

    workbook.save(output_path)

    os.remove(input_path)

    return send_file(output_path, as_attachment=True, download_name="converted.xlsx")

def detect_tables(drawings):
    h_lines = []
    v_lines = []

    for drawing in drawings:
        for item in drawing["items"]:
            if item[0] != "l":
                continue
            p1, p2 = item[1], item[2]
            x0, y0 = p1.x, p1.y
            x1, y1 = p2.x, p2.y

            if abs(y1 - y0) < 1 and abs(x1 - x0) > 5:
                h_lines.append((round((y0 + y1) / 2, 1), min(x0, x1), max(x0, x1)))
            elif abs(x1 - x0) < 1 and abs(y1 - y0) > 5:
                v_lines.append((round((x0 + x1) / 2, 1), min(y0, y1), max(y0, y1)))

    if len(h_lines) < 3 or len(v_lines) < 3:
        return []

    def cluster(values, tol=2):
        values = sorted(values)
        clusters = []
        for v in values:
            if clusters and v - clusters[-1][-1] <= tol:
                clusters[-1].append(v)
            else:
                clusters.append([v])
        return [sum(c) / len(c) for c in clusters]

    v_sorted = sorted(v_lines, key=lambda v: v[1])
    groups = []
    for v in v_sorted:
        placed = False
        for g in groups:
            gy0, gy1 = g["y_range"]
            if not (v[2] < gy0 - 10 or v[1] > gy1 + 10):
                g["v_lines"].append(v)
                g["y_range"] = (min(gy0, v[1]), max(gy1, v[2]))
                placed = True
                break
        if not placed:
            groups.append({"v_lines": [v], "y_range": (v[1], v[2])})

    tables = []
    for g in groups:
        col_xs = cluster([v[0] for v in g["v_lines"]])
        if len(col_xs) < 2:
            continue

        gy0, gy1 = g["y_range"]
        table_x0 = min(col_xs)
        table_x1 = max(col_xs)

        relevant_h = [
            h for h in h_lines
            if gy0 - 5 <= h[0] <= gy1 + 5
            and h[1] <= table_x0 + 5 and h[2] >= table_x1 - 5
        ]
        row_ys = cluster([h[0] for h in relevant_h])

        if len(row_ys) < 2:
            continue

        tables.append({
            "bbox": (table_x0, min(row_ys), table_x1, max(row_ys)),
            "row_ys": sorted(row_ys),
            "col_xs": sorted(col_xs),
        })

    return tables


@app.route("/convert-to-ppt-editable", methods=["POST"])
def convert_to_ppt_editable():
    file = request.files["file"]
    temp_dir = tempfile.gettempdir()
    input_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    output_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pptx")

    file.save(input_path)

    pdf_doc = fitz.open(input_path)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    for page in pdf_doc:
        page_rect = page.rect
        scale_x = prs.slide_width / page_rect.width
        scale_y = prs.slide_height / page_rect.height

        slide = prs.slides.add_slide(blank_layout)

        image_list = page.get_images(full=True)
        for img in image_list:
            xref = img[0]
            try:
                base_image = pdf_doc.extract_image(xref)
                img_bytes = base_image["image"]
                img_ext = base_image["ext"]
            except Exception:
                continue

            img_rects = page.get_image_rects(xref)
            if not img_rects:
                continue

            for rect in img_rects:
                img_path = os.path.join(temp_dir, f"{uuid.uuid4()}.{img_ext}")
                with open(img_path, "wb") as f:
                    f.write(img_bytes)

                left = Emu(int(rect.x0 * scale_x))
                top = Emu(int(rect.y0 * scale_y))
                width = Emu(int((rect.x1 - rect.x0) * scale_x))
                height = Emu(int((rect.y1 - rect.y0) * scale_y))

                slide.shapes.add_picture(img_path, left, top, width=width, height=height)
                os.remove(img_path)

        drawings = page.get_drawings()

        tables_info = detect_tables(drawings)

        table_bboxes = []
        for table_info in tables_info:
            table_bbox = table_info["bbox"]
            table_bboxes.append(table_bbox)
            row_ys = table_info["row_ys"]
            col_xs = table_info["col_xs"]

            n_rows = len(row_ys) - 1
            n_cols = len(col_xs) - 1

            if n_rows <= 0 or n_cols <= 0:
                continue

            t_left = Emu(int(col_xs[0] * scale_x))
            t_top = Emu(int(row_ys[0] * scale_y))
            t_width = Emu(int((col_xs[-1] - col_xs[0]) * scale_x))
            t_height = Emu(int((row_ys[-1] - row_ys[0]) * scale_y))

            graphic_frame = slide.shapes.add_table(n_rows, n_cols, t_left, t_top, t_width, t_height)
            pptx_table = graphic_frame.table

            for i in range(n_cols):
                col_width = col_xs[i + 1] - col_xs[i]
                pptx_table.columns[i].width = Emu(int(col_width * scale_x))

            for i in range(n_rows):
                row_height = row_ys[i + 1] - row_ys[i]
                pptx_table.rows[i].height = Emu(int(row_height * scale_y))

            page_text_dict = page.get_text("dict")
            for block in page_text_dict["blocks"]:
                if block["type"] != 0:
                    continue
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue

                        cx = (span["bbox"][0] + span["bbox"][2]) / 2
                        cy = (span["bbox"][1] + span["bbox"][3]) / 2

                        if not (table_bbox[0] <= cx <= table_bbox[2] and table_bbox[1] <= cy <= table_bbox[3]):
                            continue

                        col_idx = None
                        for i in range(n_cols):
                            if col_xs[i] <= cx <= col_xs[i + 1]:
                                col_idx = i
                                break

                        row_idx = None
                        for i in range(n_rows):
                            if row_ys[i] <= cy <= row_ys[i + 1]:
                                row_idx = i
                                break

                        if col_idx is None or row_idx is None:
                            continue

                        cell = pptx_table.cell(row_idx, col_idx)
                        if cell.text_frame.text:
                            cell.text_frame.text += " " + text
                        else:
                            cell.text_frame.text = text

                        for para in cell.text_frame.paragraphs:
                            for run in para.runs:
                                run.font.size = Pt(max(int(span.get("size", 12) * 0.85), 6))

        for drawing in drawings:
            for item in drawing["items"]:
                if item[0] == "l":
                    p1, p2 = item[1], item[2]
                    x0, y0 = p1.x, p1.y
                    x1, y1 = p2.x, p2.y

                    skip = False
                    for tb in table_bboxes:
                        if (tb[0] - 2 <= x0 <= tb[2] + 2 and
                            tb[1] - 2 <= y0 <= tb[3] + 2):
                            skip = True
                            break
                    if skip:
                        continue

                    line_len_x = abs(x1 - x0)
                    line_len_y = abs(y1 - y0)

                    if line_len_x > page_rect.width * 0.95 and line_len_y < 2:
                        continue
                    if line_len_y > page_rect.height * 0.95 and line_len_x < 2:
                        continue

                    left = Emu(int(min(x0, x1) * scale_x))
                    top = Emu(int(min(y0, y1) * scale_y))
                    width = Emu(max(int(abs(x1 - x0) * scale_x), 1))
                    height = Emu(max(int(abs(y1 - y0) * scale_y), 1))

                    line_shape = slide.shapes.add_connector(1, left, top, left + width, top + height)

                    color = drawing.get("color")
                    if color:
                        r, g, b = [int(c * 255) for c in color]
                        line_shape.line.color.rgb = RGBColor(r, g, b)
                    else:
                        line_shape.line.color.rgb = RGBColor(0, 0, 0)

                    line_width = drawing.get("width") or 1
                    line_shape.line.width = Pt(max(line_width, 0.5))

                    dashes = drawing.get("dashes")
                    if dashes and dashes != "[] 0":
                        line_shape.line.dash_style = MSO_LINE_DASH_STYLE.DASH

        text_blocks = page.get_text("dict")["blocks"]
        text_blocks = [b for b in text_blocks if b["type"] == 0]

        all_lines = []
        for block in text_blocks:
            for line in block["lines"]:
                has_text = any(span["text"].strip() for span in line["spans"])
                if not has_text:
                    continue

                lx0, ly0, lx1, ly1 = line["bbox"]
                lcx = (lx0 + lx1) / 2
                lcy = (ly0 + ly1) / 2

                skip = False
                for tb in table_bboxes:
                    if (tb[0] - 2 <= lcx <= tb[2] + 2 and
                        tb[1] - 2 <= lcy <= tb[3] + 2):
                        skip = True
                        break
                if skip:
                    continue

                all_lines.append({
                    "spans": line["spans"],
                    "bbox": line["bbox"],
                })

        all_lines.sort(key=lambda l: (l["bbox"][1], l["bbox"][0]))

        merged_lines = []
        for line in all_lines:
            x0, y0, x1, y1 = line["bbox"]

            if merged_lines:
                prev = merged_lines[-1]
                px0, py0, px1, py1 = prev["bbox"]
                vertical_gap = y0 - py1
                x_start_diff = abs(x0 - px0)

                if vertical_gap < 4 and vertical_gap >= -1 and x_start_diff < 10:
                    prev["spans_list"].append(line["spans"])
                    prev["bbox"] = (min(px0, x0), py0, max(px1, x1), max(py1, y1))
                    continue

            merged_lines.append({"spans_list": [line["spans"]], "bbox": (x0, y0, x1, y1)})

        for block in merged_lines:
            x0, y0, x1, y1 = block["bbox"]

            left = Emu(int(x0 * scale_x))
            top = Emu(int(y0 * scale_y))
            width = Emu(int((x1 - x0) * scale_x))
            height = Emu(int((y1 - y0) * scale_y))

            textbox = slide.shapes.add_textbox(left, top, width, height)
            tf = textbox.text_frame
            tf.word_wrap = True

            first_para = True
            for spans in block["spans_list"]:
                if first_para:
                    para = tf.paragraphs[0]
                    first_para = False
                else:
                    para = tf.add_paragraph()

                for span in spans:
                    text = span["text"]
                    if not text:
                        continue

                    has_pua = any(0xE000 <= ord(ch) <= 0xF8FF for ch in text)
                    if has_pua:
                        cleaned = ""
                        for ch in text:
                            if 0xE000 <= ord(ch) <= 0xF8FF:
                                cleaned += "\u2022 "
                            else:
                                cleaned += ch
                        text = cleaned

                    run = para.add_run()
                    run.text = text

                    font_size = span.get("size", 18)
                    run.font.size = Pt(max(int(font_size * 0.9), 8))

                    font_name = span.get("font")
                    if font_name and not has_pua:
                        run.font.name = font_name

                    flags = span.get("flags", 0)
                    run.font.bold = bool(flags & 2 ** 4)
                    run.font.italic = bool(flags & 2 ** 1)

                    color_int = span.get("color", 0)
                    r = (color_int >> 16) & 255
                    g = (color_int >> 8) & 255
                    b = color_int & 255
                    run.font.color.rgb = RGBColor(r, g, b)

    pdf_doc.close()
    prs.save(output_path)
    os.remove(input_path)

    return send_file(output_path, as_attachment=True, download_name="converted.pptx")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)