from flask import Flask, request, send_file
from pdf2docx import Converter
import os
import uuid
import tempfile

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)