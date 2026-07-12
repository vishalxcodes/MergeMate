import { mergePDFs } from "../pdf";

let selectedFiles = [];

export function initMergeView() {

    const pdfInput = document.getElementById("pdfInput");
    const mergeBtn = document.getElementById("mergeBtn");
    const fileList = document.getElementById("fileList");
    const dropZone = document.getElementById("dropZone");

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

    }

    function attachRemoveEvents() {

        document.querySelectorAll(".remove-btn").forEach(button => {

            button.addEventListener("click", () => {

                selectedFiles.splice(button.dataset.index, 1);

                renderFileList();
                attachRemoveEvents();
                updateMergeButton();

            });

        });

    }

    function updateMergeButton() {

        mergeBtn.disabled = selectedFiles.length < 2;

        mergeBtn.textContent =
            selectedFiles.length >= 2
                ? "Merge PDFs"
                : "Select at least 2 PDFs";

    }

    pdfInput.addEventListener("change", () => {

       selectedFiles = [
    ...selectedFiles,
    ...[...pdfInput.files].filter(
        file => file.type === "application/pdf"
    )
];

selectedFiles = selectedFiles.filter(
    (file, index, self) =>
        index === self.findIndex(
            f =>
                f.name === file.name &&
                f.size === file.size
        )
);

        renderFileList();
        attachRemoveEvents();
        updateMergeButton();

    });

    dropZone.addEventListener("dragover", e => {

        e.preventDefault();
        dropZone.classList.add("dragover");

    });

    dropZone.addEventListener("dragleave", () => {

        dropZone.classList.remove("dragover");

    });

    dropZone.addEventListener("drop", e => {

        e.preventDefault();

        dropZone.classList.remove("dragover");

       selectedFiles = [
    ...selectedFiles,
    ...[...e.dataTransfer.files].filter(
        file => file.type === "application/pdf"
    )
];
selectedFiles = selectedFiles.filter(
    (file, index, self) =>
        index === self.findIndex(
            f =>
                f.name === file.name &&
                f.size === file.size
        )
);

        renderFileList();
        attachRemoveEvents();
        updateMergeButton();

    });

    mergeBtn.addEventListener("click", async () => {

        if (selectedFiles.length < 2) {

            alert("Please select at least 2 PDFs.");
            return;

        }

        mergeBtn.disabled = true;
        mergeBtn.textContent = "⏳ Merging...";

       try {

    await mergePDFs(selectedFiles);

    alert("✅ PDF merged successfully!");

} catch (error) {

    alert("❌ Something went wrong while merging.");

    console.error(error);

} finally {

    updateMergeButton();

}

    });

    updateMergeButton();

}