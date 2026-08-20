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

 document.querySelectorAll('input[name="compressionLevel"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const targetInputs = document.getElementById('targetSizeInputs');
            targetInputs.style.display =
                document.querySelector('input[name="compressionLevel"]:checked').value === 'custom'
                    ? 'flex'
                    : 'none';
        });
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

    let targetBytes = null;
    if (selectedLevel === "custom") {
        const value = parseFloat(document.getElementById("targetSizeValue").value);
        const unit = document.getElementById("targetSizeUnit").value;

        if (!value || value <= 0) {
            showToast("Please enter a valid target size", "error");
            btn.disabled = false;
            btn.textContent = "Compress PDF";
            return;
        }

        targetBytes = unit === "MB" ? value * 1024 * 1024 : value * 1024;
    }

    try {

        for (const file of selectedPdfs) {

            const arrayBuffer = await file.arrayBuffer();

            // Take a permanent, independent snapshot of the original bytes
            const originalBytes = new Uint8Array(arrayBuffer).slice();

            let compressedBytes;

            if (selectedLevel === "custom") {
                compressedBytes = await compressToTargetSize(originalBytes, targetBytes, btn);
            } else {

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

                compressedBytes = await compressWithSettings(originalBytes, imageQuality, renderScale);
            }

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

// Reusable function — compress with given quality/scale settings
async function compressWithSettings(originalBytes, imageQuality, renderScale) {

    // Fresh independent copy every time, from the untouched snapshot
    const bufferCopy = originalBytes.slice().buffer;

    const pdf = await pdfjsLib.getDocument({
        data: bufferCopy
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

        const imageData = canvas.toDataURL("image/jpeg", imageQuality);

        const jpgBytes = await fetch(imageData)
            .then(res => res.arrayBuffer());

        const image = await newPdf.embedJpg(jpgBytes);

        const newPage = newPdf.addPage([image.width, image.height]);

        newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height
        });

    }

    return await newPdf.save();
}

async function compressToTargetSize(originalBytes, targetBytes, btn) {

    // Phase 1: coarse sweep, high to low
    const candidates = [
        { quality: 0.95, scale: 3.5 },
        { quality: 0.93, scale: 3.0 },
        { quality: 0.9, scale: 2.5 },
        { quality: 0.88, scale: 2.2 },
        { quality: 0.85, scale: 2.0 },
        { quality: 0.8, scale: 1.75 },
        { quality: 0.75, scale: 1.5 },
        { quality: 0.65, scale: 1.2 },
        { quality: 0.5, scale: 1.0 },
        { quality: 0.4, scale: 0.8 },
        { quality: 0.3, scale: 0.6 },
        { quality: 0.2, scale: 0.4 },
    ];

    let bestUnder = null;
    let bestUnderSize = -Infinity;
    let bestUnderSettings = null;

    let smallestOverExceeding = null; // the smallest "over target" candidate right before we dipped under
    let smallestOverSettings = null;

    let smallestOverall = null;
    let smallestOverallSize = Infinity;

    let totalTries = candidates.length + 4; // +4 for refinement phase
    let tryCount = 0;

    for (let i = 0; i < candidates.length; i++) {

        tryCount++;
        btn.textContent = `Compressing... (try ${tryCount}/${totalTries})`;

        const { quality, scale } = candidates[i];
        const result = await compressWithSettings(originalBytes, quality, scale);
        const size = result.byteLength;

        if (size < smallestOverallSize) {
            smallestOverallSize = size;
            smallestOverall = result;
        }

        if (size <= targetBytes) {
            if (size > bestUnderSize) {
                bestUnderSize = size;
                bestUnder = result;
                bestUnderSettings = { quality, scale };
            }
            // We found our first "under" — the previous candidate (if any) was the closest "over"
            if (i > 0 && !smallestOverExceeding) {
                smallestOverSettings = candidates[i - 1];
            }
            break; // stop coarse sweep, move to refinement
        }
    }

    // Phase 2: refine between bestUnderSettings and smallestOverSettings (if both exist)
    if (bestUnderSettings && smallestOverSettings) {

        let lowScale = bestUnderSettings.scale;   // under target
        let highScale = smallestOverSettings.scale; // over target
        const quality = (bestUnderSettings.quality + smallestOverSettings.quality) / 2;

        for (let j = 0; j < 4; j++) {

            tryCount++;
            btn.textContent = `Compressing... (try ${tryCount}/${totalTries})`;

            const midScale = (lowScale + highScale) / 2;
            const result = await compressWithSettings(originalBytes, quality, midScale);
            const size = result.byteLength;

            if (size < smallestOverallSize) {
                smallestOverallSize = size;
                smallestOverall = result;
            }

            if (size <= targetBytes) {
                if (size > bestUnderSize) {
                    bestUnderSize = size;
                    bestUnder = result;
                }
                lowScale = midScale; // try to push closer from below
            } else {
                highScale = midScale; // still too big
            }
        }
    }

    if (bestUnder) {
        return bestUnder;
    }

    showToast("Couldn't reach target size — used maximum compression instead", "error");
    return smallestOverall;
}