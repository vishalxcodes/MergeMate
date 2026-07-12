import { splitPDF } from "../split";

export function initSplitView() {

    const pdfInput = document.getElementById("pdfInput");
    const splitBtn = document.getElementById("splitBtn");
    const splitPage = document.getElementById("splitPage");
    const fileList = document.getElementById("fileList");
    const dropZone = document.getElementById("dropZone");

    let selectedFiles = [];

    function renderFileList() {

        fileList.innerHTML = "";

        selectedFiles.forEach((file, index) => {

            const fileSize = (file.size / 1024 / 1024).toFixed(2);

            fileList.innerHTML += `
                <div class="file-item">
                    <span class="file-name">
                        📄 ${file.name}<br>
                        <small>${fileSize} MB</small>
                    </span>

                    <button class="remove-btn" data-index="${index}">
                        ×
                    </button>
                </div>
            `;

        });

        attachRemoveEvents();
    }

    function attachRemoveEvents() {

        document.querySelectorAll(".remove-btn").forEach(btn => {

            btn.onclick = () => {

                selectedFiles.splice(btn.dataset.index, 1);

                renderFileList();

            };

        });

    }

    pdfInput.onchange = () => {

        selectedFiles = [...pdfInput.files].filter(
            file => file.type === "application/pdf"
        );

        renderFileList();

    };

    dropZone.ondragover = e => {

        e.preventDefault();

        dropZone.classList.add("dragover");

    };

    dropZone.ondragleave = () => {

        dropZone.classList.remove("dragover");

    };

    dropZone.ondrop = e => {

        e.preventDefault();

        dropZone.classList.remove("dragover");

        selectedFiles = [...e.dataTransfer.files].filter(
            file => file.type === "application/pdf"
        );

        renderFileList();

    };

    splitBtn.onclick = async () => {

        if (selectedFiles.length !== 1) {

            alert("Please select exactly one PDF.");

            return;

        }

        const page = Number(splitPage.value);

        if (!page) {

            alert("Enter a valid page number.");

            return;

        }

        await splitPDF(selectedFiles[0], page);

    };

}