import Sortable from "sortablejs";
import { PDFDocument } from "pdf-lib";
let selectedImages = [];

export function initImageToPdf() {

    const input = document.getElementById("imageInput");
    const preview = document.getElementById("imagePreview");
    const dropZone = document.getElementById("imageDropZone");
    const createBtn = document.getElementById("createPdfBtn");

    createBtn.addEventListener("click", createPDF);
    ["dragenter", "dragover"].forEach(event => {

    dropZone.addEventListener(event, (e) => {

        e.preventDefault();

        dropZone.classList.add("dragging");

    });

});
["dragleave", "drop"].forEach(event => {

    dropZone.addEventListener(event, (e) => {

        e.preventDefault();

        dropZone.classList.remove("dragging");

    });

});
dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    const files = [...e.dataTransfer.files].filter(file =>
        file.type.startsWith("image/")
    );

    selectedImages.push(...files);

    renderPreview(preview);

});

dropZone.addEventListener("click", () => {

    input.click();

});

    input.addEventListener("change", (e) => {

        selectedImages.push(...Array.from(e.target.files));

        renderPreview(preview);

        input.value = "";

    });

}

function renderPreview(preview){

    updateDropZone();
    const btn=document.getElementById("createPdfBtn");

    btn.textContent=`Create PDF (${selectedImages.length})`;
    preview.innerHTML = "";

    selectedImages.forEach((file,index)=>{

        const reader = new FileReader();

        reader.onload = (e)=>{

            const card=document.createElement("div");

            card.className="image-card";

            card.innerHTML=`

    <div class="image-number">
        ${index + 1}
    </div>

    <button class="remove-image" data-index="${index}">
        ×
    </button>

    <img
        src="${e.target.result}"
        class="preview-image"
    >

`;

            preview.appendChild(card);

        };

        reader.readAsDataURL(file);

    });

    new Sortable(preview, {

    animation: 200,

    onEnd: (evt) => {

        const moved = selectedImages.splice(evt.oldIndex, 1)[0];

        selectedImages.splice(evt.newIndex, 0, moved);

        renderPreview(preview);

    }

});

}

function updateDropZone(){

    const icon=document.getElementById("uploadIcon");
    const title=document.getElementById("uploadTitle");
    const sub=document.getElementById("uploadSubtitle");

    if(selectedImages.length===0){

        icon.textContent="🖼️";
        title.textContent="Drag & Drop Images Here";
        sub.textContent="or click to browse";

    }else{

        icon.textContent="➕";
        title.textContent="Add More Images";
        sub.textContent="Drag or Click to Continue";

    }

    const btn = document.getElementById("createPdfBtn");

if (btn) {

    btn.textContent = selectedImages.length
        ? `Create PDF (${selectedImages.length})`
        : "Create PDF";

}

}

document.addEventListener("click",(e)=>{

    if(!e.target.classList.contains("remove-image")) return;

    const index=Number(e.target.dataset.index);

    selectedImages.splice(index,1);

    renderPreview(
        document.getElementById("imagePreview")
    );

});
async function createPDF(){

if(selectedImages.length===0){

    document.getElementById("createPdfBtn").textContent="Create PDF";

    showToast("Please select images","error");

    return;

}
const btn = document.getElementById("createPdfBtn");

btn.disabled = true;
btn.textContent = "Creating PDF...";

const pdfDoc = await PDFDocument.create();
for(const imageFile of selectedImages){
const imageBytes = await imageFile.arrayBuffer();
let image;

if (imageFile.type === "image/png") {

    image = await pdfDoc.embedPng(imageBytes);

} else {

    image = await pdfDoc.embedJpg(imageBytes);

}
const { width, height } = image.scale(1);

const page = pdfDoc.addPage([width, height]);
page.drawImage(image, {

    x: 0,

    y: 0,

    width,

    height,

});



}

const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes], {
    type: "application/pdf"
});

const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;

const today = new Date().toISOString().split("T")[0];

a.download = `MergeMate-Images-${today}.pdf`;

a.click();

URL.revokeObjectURL(url);

btn.disabled = false;
btn.textContent = `Create PDF (${selectedImages.length})`;

showToast("PDF Created Successfully");

    
}