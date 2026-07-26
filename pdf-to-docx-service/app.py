from flask import Flask, request, send_file
from pdf2docx import Converter
import os
import uuid
import tempfile
import pdfplumber
import openpyxl
from openpyxl.styles import Font, Border, Side, PatternFill
from openpyxl.utils import get_column_letter

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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)