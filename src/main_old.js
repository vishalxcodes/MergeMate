import './style.css';
import { mergePDFs } from "./pdf";
import { splitPDF } from "./split";
import { deletePage } from "./delete";
import { extractPages } from "./extract";
import { rotatePages } from "./rotate";

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

<div class="tool-section">

<h3 class="tool-title">📄 Merge PDF</h3>
    <button id="mergeBtn">
      Merge PDFs
    </button>
    </div>
       
     <div class="tool-section">

<h3 class="tool-title">
✂️ Split PDF
</h3>
    <input
    type="number"
    id="splitPage"
    placeholder="Split after page (e.g. 5)"
    min="1"
/>
    <button id="splitBtn">
  ✂️ Split PDF
</button>
</div>

<input
    type="text"
    id="deletePageInput"
   placeholder="Delete pages (e.g. 2,4,7 or 5-10)"
    min="1"
/>

<button id="deleteBtn">
    🗑 Delete Page
</button>
<input
    type="text"
    id="extractPageInput"
    placeholder="Extract pages (e.g. 1,3,5-7)"
>

<button id="extractBtn">
    📑 Extract Pages
</button>

<input
    type="text"
    id="rotatePageInput"
    placeholder="Rotate pages (e.g. 2,4,5-7)"
>

<select id="rotateAngle">
    <option value="90">90°</option>
    <option value="180">180°</option>
    <option value="270">270°</option>
</select>

<button id="rotateBtn">
    🔄 Rotate PDF
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
const extractBtn = document.getElementById("extractBtn");

const rotateBtn = document.getElementById("rotateBtn");

rotateBtn.addEventListener("click", async () => {

    if(selectedFiles.length!==1){
        alert("Please select one PDF.");
        return;
    }

    const pages=document
        .getElementById("rotatePageInput")
        .value
        .trim();

    if(!pages){
        alert("Enter page numbers.");
        return;
    }

    const angle=Number(
        document.getElementById("rotateAngle").value
    );

    await rotatePages(
        selectedFiles[0],
        pages,
        angle
    );

});

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

extractBtn.addEventListener("click", async () => {

    if (selectedFiles.length !== 1) {
        alert("Please select exactly one PDF.");
        return;
    }

    const pages = document
        .getElementById("extractPageInput")
        .value
        .trim();

    if (!pages) {
        alert("Please enter page numbers.");
        return;
    }

    await extractPages(selectedFiles[0], pages);

});