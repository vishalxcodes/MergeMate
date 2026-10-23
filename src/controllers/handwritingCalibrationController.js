import { renderHwReviewGrid } from "../views/handwritingCalibrationView.js";


const HW_API = window.location.hostname === "localhost"
    ? "http://localhost:3000/api/handwriting"
    : "https://mergemate-emgy.onrender.com/api/handwriting";

let selectedFile = null;
let lastResult = null;
let blobs = [];

const EXPECTED_SEQUENCE = [
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ..."0123456789",
    ..."., ?!'\"-".replace(" ", "").split("")
];

// Note: EXPECTED_SEQUENCE must stay in the exact same order as
// HANDWRITING_EXPECTED_SEQUENCE in the Python service (app.py), since the
// review grid is built by iterating this array against the returned glyphs.


export function initHandwritingCalibrationView() {

    const dropZone =
        document.getElementById("hwDropZone");

    const input =
        document.getElementById("hwInput");

    const fileInfo =
        document.getElementById("hwFileInfo");

    const processBtn =
        document.getElementById("hwProcessBtn");

    const reviewSection =
        document.getElementById("hwReviewSection");


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


    dropZone.addEventListener("drop", (e) => {

        const file = [...e.dataTransfer.files]
            .find(file =>
                file.type.startsWith("image/")
            );

        if (!file) {

            showToast(
                "Please select an image file",
                "error"
            );

            return;

        }

        selectFile(file);

    });


    input.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file) return;

        selectFile(file);

        input.value = "";

    });


    function selectFile(file) {

        selectedFile = file;

        reviewSection.innerHTML = "";

        fileInfo.innerHTML = `

            <div class="converter-selected-file">

                📷

                <strong>
                    ${file.name}
                </strong>

                <span>
                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                </span>

            </div>

        `;

        processBtn.disabled = false;

    }


    processBtn.addEventListener(
        "click",
        processHandwritingPhoto
    );


    async function processHandwritingPhoto() {

        if (!selectedFile) return;

        processBtn.disabled = true;

        processBtn.textContent = "Processing...";

        try {

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const response =
                await fetch(
                    `${HW_API}/segment`,
                    {
                        method: "POST",
                        body: formData
                    }
                );

            if (!response.ok) {

                const error =
                    await response.json();

                throw new Error(
                    error.error ||
                    "Processing failed"
                );

            }

            const result =
                await response.json();

            lastResult = result;

            blobs = Array.isArray(result.blobs)
                ? [...result.blobs]
                : EXPECTED_SEQUENCE.map(char => result.glyphs[char] || null);

            renderReview();

            reviewSection.scrollIntoView({
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);

            showToast(
                "Could not process this photo",
                "error"
            );

        }

        processBtn.disabled = false;

        processBtn.textContent =
            "Process Photo";

    }


        function renderReview() {

        reviewSection.innerHTML =
            renderHwReviewGrid(blobs, EXPECTED_SEQUENCE);

        wireReviewButtons();

    }


    function wireReviewButtons() {

        const confirmBtn = document.getElementById("hwConfirmBtn");
        const retakeBtn = document.getElementById("hwRetakeBtn");

        confirmBtn.addEventListener("click", saveHandwriting);

        retakeBtn.addEventListener("click", () => {

            reviewSection.innerHTML = "";
            fileInfo.innerHTML = "";
            selectedFile = null;
            lastResult = null;
            blobs = [];
            processBtn.disabled = true;

        });

        reviewSection.querySelectorAll("[data-hw-action]").forEach(btn => {

            btn.addEventListener("click", () => {

                const index = Number(btn.dataset.index);

                if (btn.dataset.hwAction === "delete") {

                    if (index < blobs.length) blobs.splice(index, 1);

                } else {

                    while (blobs.length < index) blobs.push(null);
                    blobs.splice(index, 0, null);

                }

                renderReview();

            });

        });

    }


    async function saveHandwriting() {

                const glyphs = {};

        EXPECTED_SEQUENCE.forEach((char, i) => {
            if (blobs[i]) glyphs[char] = blobs[i];
        });

        if (
            blobs.length !== EXPECTED_SEQUENCE.length ||
            Object.keys(glyphs).length !== EXPECTED_SEQUENCE.length
        ) {
            showToast("Please fix the highlighted boxes first", "error");
            return;
        }

        const confirmBtn =
            document.getElementById("hwConfirmBtn");

        confirmBtn.disabled = true;

        confirmBtn.textContent = "Saving...";

        try {

            const response =
                await fetch(
                    `${HW_API}/save`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            glyphs
                        })
                    }
                );

            if (!response.ok) {

                const error =
                    await response.json();

                throw new Error(
                    error.error ||
                    "Save failed"
                );

            }

            showToast(
                "Your handwriting has been saved"
            );

        } catch (error) {

            console.error(error);

            showToast(
                "Could not save your handwriting",
                "error"
            );

        }

        confirmBtn.disabled = false;

        confirmBtn.textContent =
            "Yes, Save My Handwriting";

    }

}