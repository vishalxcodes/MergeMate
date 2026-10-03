import { renderHwReviewGrid } from "../views/handwritingCalibrationView.js";


const HW_API = window.location.hostname === "localhost"
    ? "http://localhost:3000/api/handwriting"
    : "https://mergemate-emgy.onrender.com/api/handwriting";

let selectedFile = null;
let lastResult = null;

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

            reviewSection.innerHTML =
                renderHwReviewGrid(
                    result.glyphs,
                    EXPECTED_SEQUENCE,
                    result.detected_count,
                    result.expected_count
                );

            wireReviewButtons();

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


    function wireReviewButtons() {

        const confirmBtn =
            document.getElementById("hwConfirmBtn");

        const retakeBtn =
            document.getElementById("hwRetakeBtn");

        confirmBtn.addEventListener(
            "click",
            saveHandwriting
        );

        retakeBtn.addEventListener("click", () => {

            reviewSection.innerHTML = "";

            fileInfo.innerHTML = "";

            selectedFile = null;

            lastResult = null;

            processBtn.disabled = true;

        });

    }


    async function saveHandwriting() {

        if (!lastResult) return;

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
                            glyphs: lastResult.glyphs
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