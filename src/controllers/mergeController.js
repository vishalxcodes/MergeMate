import { mergePDFs } from "../pdf";
import Sortable from "sortablejs";

let selectedFiles = [];

export function initMergeView() {

    const pdfInput = document.getElementById("pdfInput");
    const mergeBtn = document.getElementById("mergeBtn");
    const fileList = document.getElementById("fileList");
    const dropZone = document.getElementById("dropZone");
    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");

    function renderFileList() {

        fileList.innerHTML = "";

        selectedFiles.forEach((file, index) => {

            const fileSize = (file.size / 1024 / 1024).toFixed(2);

            fileList.innerHTML += `
                <div class="file-item">
                  <div class="file-content">

    <span class="drag-handle">☰</span>

    <span class="file-name">
        📄 ${file.name}<br>
        <small>${fileSize} MB</small>
    </span>

</div>

<button class="remove-btn" data-index="${index}">
    ×
</button>
                </div>
            `;
            new Sortable(fileList, {
    animation: 200,
    handle: ".drag-handle",

     delayOnTouchOnly: true,
    delay: 150,
    touchStartThreshold: 5,

    onEnd: (evt) => {

        const movedFile = selectedFiles.splice(evt.oldIndex, 1)[0];

        selectedFiles.splice(evt.newIndex, 0, movedFile);

    }
});

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
        progressContainer.style.display = "block";
        progressText.style.display = "block";

        progressFill.style.width = "20%";
        progressText.textContent = "Preparing PDFs...";

       try {
     progressFill.style.width = "70%";
    progressText.textContent = "Merging PDFs...";

    await mergePDFs(selectedFiles);

    progressFill.style.width = "100%";
    progressText.textContent = "Finalizing...";

    window.showToast("✅ PDF merged successfully!");

} catch (error) {

    window.showToast("❌ Something went wrong while merging.", "error");

    console.error(error);

} finally {

    setTimeout(() => {

        progressContainer.style.display = "none";
        progressText.style.display = "none";

        progressFill.style.width = "0%";

    }, 800);

    updateMergeButton();

}

    });

    updateMergeButton();

}