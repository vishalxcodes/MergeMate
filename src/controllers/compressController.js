import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
pdfjsLib.GlobalWorkerOptions.workerSrc =
    new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
    ).toString();

let selectedPdfs = [];
export function initCompressView() {

    const dropZone = document.getElementById("compressDropZone");
    const input = document.getElementById("compressInput");
    const compressBtn = document.getElementById("compressBtn");

compressBtn.addEventListener("click", compressPDFs);

    dropZone.addEventListener("click", () => {

        input.click();

    });

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
    document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("remove-compress-file")) return;

    const index = Number(e.target.dataset.index);

    selectedPdfs.splice(index, 1);

    showSelectedFiles();

});

    dropZone.addEventListener("drop", (e) => {

        const files = [...e.dataTransfer.files]
    .filter(file => file.type === "application/pdf");

if (files.length === 0) {

    showToast("Please select PDF files", "error");

    return;

}

selectedPdfs.push(...files);

showSelectedFiles();

    });

    input.addEventListener("change", (e) => {

        const files = Array.from(e.target.files);

    selectedPdfs.push(...files);

    showSelectedFiles();

    input.value = "";

    });

}
function showSelectedFiles() {

    const fileInfo = document.getElementById("compressFileInfo");

    fileInfo.innerHTML = "";

    selectedPdfs.forEach((file, index) => {

        const card = document.createElement("div");

        card.className = "selected-pdf";

        card.innerHTML = `

            <span>📄</span>

            <strong>${file.name}</strong>

            <span>
                ${(file.size / 1024 / 1024).toFixed(2)} MB
            </span>

            <button
                class="remove-compress-file"
                data-index="${index}"
            >
                ×
            </button>

        `;

        fileInfo.appendChild(card);

    });
    const compressBtn = document.getElementById("compressBtn");

compressBtn.disabled = selectedPdfs.length === 0;

}
async function compressPDFs() {

    if (selectedPdfs.length === 0) {

        showToast("Please select PDF files", "error");

        return;

    }

    const btn = document.getElementById("compressBtn");

    btn.disabled = true;
    btn.textContent = "Compressing...";

    const selectedLevel =
    document.querySelector(
        'input[name="compressionLevel"]:checked'
    ).value;

    let imageQuality;
let renderScale;

if (selectedLevel === "high") {

    imageQuality = 0.85;
    renderScale = 1.5;

} else if (selectedLevel === "balanced") {

    imageQuality = 0.65;
    renderScale = 1;

} else {

    imageQuality = 0.4;
    renderScale = 0.75;

}

    try {

        for (const file of selectedPdfs) {

            const arrayBuffer = await file.arrayBuffer();

            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;

            const newPdf = await PDFDocument.create();

            for (let i = 1; i <= pdf.numPages; i++) {

                const page = await pdf.getPage(i);

                const viewport = page.getViewport({
                    scale: renderScale
                });

                const canvas = document.createElement("canvas");

                const context = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const imageData = canvas.toDataURL(
                    "image/jpeg",
                   imageQuality
                );

                const jpgBytes = await fetch(imageData)
                    .then(res => res.arrayBuffer());

                const image = await newPdf.embedJpg(jpgBytes);

                const newPage = newPdf.addPage([
                    image.width,
                    image.height
                ]);

                newPage.drawImage(image, {

                    x: 0,
                    y: 0,

                    width: image.width,
                    height: image.height

                });

            }

            const compressedBytes = await newPdf.save();

            const blob = new Blob(
                [compressedBytes],
                { type: "application/pdf" }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download =
                file.name.replace(
                    ".pdf",
                    "-compressed.pdf"
                );

            a.click();

            URL.revokeObjectURL(url);

        }

        showToast("PDF Compressed Successfully");

    } catch (error) {

        console.error(error);

        showToast(
            "Compression failed",
            "error"
        );

    }

    btn.disabled = false;

    btn.textContent = "Compress PDF";

}