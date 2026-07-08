import './style.css';
import { mergePDFs } from "./pdf";
import { splitPDF } from "./split";
import { deletePage } from "./delete";

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>📄 MergeMate</h1>
    <p>Merge multiple PDF files into one PDF.</p>

   <div id="dropZone">
    <p>📂 Drag & Drop PDFs Here</p>
    <span>or click to browse</span>

    <input
        type="file"
        id="pdfInput"
        accept=".pdf"
        multiple
    >
</div>

<div id="fileList"></div>

<div id="fileList"></div>
    <button id="mergeBtn">
      Merge PDFs
    </button>

    <input
    type="number"
    id="splitPage"
    placeholder="Split after page (e.g. 5)"
    min="1"
/>
    <button id="splitBtn">
  ✂️ Split PDF
</button>

<input
    type="text"
    id="deletePageInput"
   placeholder="Delete pages (e.g. 2,4,7 or 5-10)"
    min="1"
/>

<button id="deleteBtn">
    🗑 Delete Page
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
const splitBtn = document.getElementById("splitBtn");
const deleteBtn = document.getElementById("deleteBtn");
const fileList = document.getElementById("fileList");
const dropZone = document.getElementById("dropZone");

pdfInput.addEventListener("change", () => {

   selectedFiles = [...pdfInput.files].filter(
    file => file.type === "application/pdf"
);

if (selectedFiles.length === 0) {
    alert("Please select only PDF files.");
}

    renderFileList();

    attachRemoveEvents();

    updateMergeButton();

});

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("dragover");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

   selectedFiles = [...e.dataTransfer.files].filter(
    file => file.type === "application/pdf"
);

if (selectedFiles.length === 0) {
    alert("Please drop only PDF files.");
}

    renderFileList();

    attachRemoveEvents();

    updateMergeButton();

});

    function attachRemoveEvents() {

    const removeButtons = document.querySelectorAll(".remove-btn");

    removeButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const index = button.dataset.index;

            selectedFiles.splice(index, 1);

            renderFileList();

            attachRemoveEvents();

            updateMergeButton();

        });

    });

}

function updateMergeButton() {

    if (selectedFiles.length >= 2) {
        mergeBtn.disabled = false;
        mergeBtn.textContent = "Merge PDFs";
    } else {
        mergeBtn.disabled = true;
        mergeBtn.textContent = "Select at least 2 PDFs";
    }

}



splitBtn.addEventListener("click", async () => {

    if (selectedFiles.length !== 1) {
        alert("Please select exactly one PDF.");
        return;
    }

    const splitPage = parseInt(document.getElementById("splitPage").value);

    if (isNaN(splitPage)) {
        alert("Please enter a valid page number.");
        return;
    }

    await splitPDF(selectedFiles[0], splitPage);

});


deleteBtn.addEventListener("click", async () => {

    if (selectedFiles.length !== 1) {
        alert("Please select exactly one PDF.");
        return;
    }

    const pages = document
    .getElementById("deletePageInput")
    .value
    .trim();

if (!pages) {
    alert("Please enter page numbers.");
    return;
}

await deletePage(selectedFiles[0], pages);

});


mergeBtn.addEventListener("click", async () => {

    const files = selectedFiles;

    if (files.length < 2) {
        alert("Please select at least 2 PDF files.");
        return;
    }

    mergeBtn.disabled = true;
    mergeBtn.textContent = "⏳ Merging...";

    try {

        await mergePDFs(files);

    } finally {

        updateMergeButton();

    }

});