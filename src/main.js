import './style.css';
import { mergePDFs } from "./pdf";

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
<div id="fileList"></div>
    <button id="mergeBtn">
      Merge PDFs
    </button>
    <div class="footer">
    🔒 No Upload • No Watermark • Free Forever
</div>
  </div>
`;

let selectedFiles = [];
function renderFileList() {

    fileList.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const fileSize = (file.size / 1024 / 1024).toFixed(2);

        fileList.innerHTML += `
            <div class="file-item">
                <span class="file-name">
                    📄 ${file.name}
                    <br>
                    <small>${fileSize} MB</small>
                </span>

                <button class="remove-btn" data-index="${index}">
                    ×
                </button>

            </div>
        `;

    });

}
const pdfInput = document.getElementById("pdfInput");
const mergeBtn = document.getElementById("mergeBtn");
const fileList = document.getElementById("fileList");

pdfInput.addEventListener("change", () => {

    selectedFiles = [...pdfInput.files];

    renderFileList();

    attachRemoveEvents();

});

    function attachRemoveEvents() {

    const removeButtons = document.querySelectorAll(".remove-btn");

    removeButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const index = button.dataset.index;

            selectedFiles.splice(index, 1);

            renderFileList();

            attachRemoveEvents();

        });

    });

}



mergeBtn.addEventListener("click", async () => {
    const files = selectedFiles;

    if (files.length < 2) {
        alert("Please select at least 2 PDF files.");
        return;
    }

    console.log(files);
   await mergePDFs(files);
});