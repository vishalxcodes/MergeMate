import './style.css';
import { PDFDocument } from 'pdf-lib';

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>📄 MergeMate</h1>
    <p>Merge multiple PDF files into one PDF.</p>

    <input
      type="file"
      id="pdfInput"
      accept=".pdf"
      multiple
    >

    <button id="mergeBtn">
      Merge PDFs
    </button>
  </div>
`;

const pdfInput = document.getElementById("pdfInput");
const mergeBtn = document.getElementById("mergeBtn");

mergeBtn.addEventListener("click", async () => {
    const files = pdfInput.files;

    if (files.length < 2) {
        alert("Please select at least 2 PDF files.");
        return;
    }

    console.log(files);
    const mergedPdf = await PDFDocument.create();

  console.log(mergedPdf);

  for (const file of files) {

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(arrayBuffer);

    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    pages.forEach((page) => {
        mergedPdf.addPage(page);
    });

}

console.log(mergedPdf.getPageCount());

const pdfBytes = await mergedPdf.save();

const blob = new Blob([pdfBytes], {
    type: "application/pdf"
});

const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = "merged.pdf";

a.click();

URL.revokeObjectURL(url);
});