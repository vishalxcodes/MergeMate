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

        text_blocks = page.get_text("dict")["blocks"]
        text_blocks = [b for b in text_blocks if b["type"] == 0]

        page_mid_x = (page_rect.x0 + page_rect.x1) / 2
        left_col = [b for b in text_blocks if b["bbox"][0] < page_mid_x]
        right_col = [b for b in text_blocks if b["bbox"][0] >= page_mid_x]

        def merge_column(col_blocks):
            col_blocks.sort(key=lambda b: b["bbox"][1])
            merged = []
            for block in col_blocks:
                has_text = any(
                    span["text"].strip()
                    for line in block["lines"]
                    for span in line["spans"]
                )
                if not has_text:
                    continue

                x0, y0, x1, y1 = block["bbox"]

                if merged:
                    prev = merged[-1]
                    px0, py0, px1, py1 = prev["bbox"]
                    vertical_gap = y0 - py1
                    horizontal_overlap = min(x1, px1) - max(x0, px0)

                    if vertical_gap < 6 and horizontal_overlap > -20:
                        prev["lines"].extend(block["lines"])
                        prev["bbox"] = (min(px0, x0), py0, max(px1, x1), max(py1, y1))
                        continue

                merged.append({"lines": list(block["lines"]), "bbox": (x0, y0, x1, y1)})
            return merged

        merged_blocks = merge_column(left_col) + merge_column(right_col)

        for block in merged_blocks:
            x0, y0, x1, y1 = block["bbox"]

            left = Emu(int(x0 * scale_x))
            top = Emu(int(y0 * scale_y))
            width = Emu(int((x1 - x0) * scale_x))
            height = Emu(int((y1 - y0) * scale_y))

            textbox = slide.shapes.add_textbox(left, top, width, height)
            tf = textbox.text_frame
            tf.word_wrap = True

            first_para = True
            for line in block["lines"]:
                if first_para:
                    para = tf.paragraphs[0]
                    first_para = False
                else:
                    para = tf.add_paragraph()

                for span in line["spans"]:
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
        for drawing in drawings:
            for item in drawing["items"]:
                if item[0] == "l":
                    p1, p2 = item[1], item[2]
                    x0, y0 = p1.x, p1.y
                    x1, y1 = p2.x, p2.y

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

        gc.collect()

    pdf_doc.close()
    prs.save(output_path)
    os.remove(input_path)

    return send_file(output_path, as_attachment=True, download_name="converted.pptx")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)