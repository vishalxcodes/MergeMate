import { encryptPDF } from "@pdfsmaller/pdf-encrypt";


let selectedPdfs = [];

export function initProtectView() {

    const dropZone = document.getElementById("protectDropZone");
    const input = document.getElementById("protectInput");
    const fileInfo = document.getElementById("protectFileInfo");
    const passwordSection = document.getElementById("protectPasswordSection");

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

       const files = [...e.dataTransfer.files]
    .filter(file => file.type === "application/pdf");

if (files.length === 0) {

    showToast("Please select PDF files", "error");

    return;

}

selectPdfs(files);

    });

    input.addEventListener("change", (e) => {

      const files = [...e.target.files]
    .filter(file => file.type === "application/pdf");

if (files.length === 0) return;

selectPdfs(files);

input.value = "";

    });

   function selectPdfs(files) {

    selectedPdfs.push(...files);

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
                class="remove-protect-file"
                data-index="${index}"
            >
                ×
            </button>

        `;

        fileInfo.appendChild(card);

    });

    passwordSection.style.display = "block";

}

    fileInfo.addEventListener("click", (e) => {

    const removeBtn =
        e.target.closest(".remove-protect-file");

    if (!removeBtn) return;

    const index =
        Number(removeBtn.dataset.index);

    selectedPdfs.splice(index, 1);

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
                class="remove-protect-file"
                data-index="${index}"
            >
                ×
            </button>

        `;

        fileInfo.appendChild(card);

    });

    if (selectedPdfs.length === 0) {

        passwordSection.style.display = "none";

    }

});

    document
        .getElementById("protectPdfBtn")
        .addEventListener("click", protectPdf);

        document.querySelectorAll(".toggle-password").forEach(button => {

    button.addEventListener("click", () => {

        const input = document.getElementById(
            button.dataset.target
        );

        if (input.type === "password") {

            input.type = "text";

            button.textContent = "🙈";

        } else {

            input.type = "password";

            button.textContent = "👁️";

        }

    });

});

}

async function protectPdf() {

 if (selectedPdfs.length === 0) {

        showToast("Please select a PDF first", "error");

        return;

    }

    const password =
        document.getElementById("protectPassword").value;

    const confirmPassword =
        document.getElementById("protectConfirmPassword").value;

    if (!password) {

        showToast("Please enter a password", "error");

        return;

    }

    if (password !== confirmPassword) {

        showToast("Passwords do not match", "error");

        return;

    }

    const btn = document.getElementById("protectPdfBtn");

    btn.disabled = true;

    btn.textContent = "Protecting PDF...";

  try {

    for (const file of selectedPdfs) {

    const pdfBytes =
        await file.arrayBuffer();

    const encryptedPdf =
        await encryptPDF(
            new Uint8Array(pdfBytes),
            password,
            {
                algorithm: "AES-256"
            }
        );

    const blob =
        new Blob(
            [encryptedPdf],
            {
                type: "application/pdf"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        `Protected-${file.name}`;

    a.click();

    URL.revokeObjectURL(url);

}

   showToast(
    `${selectedPdfs.length} PDF(s) Protected Successfully`
);

} catch (error) {

    console.error(error);

    showToast(
        "Could not protect this PDF",
        "error"
    );

}

    btn.disabled = false;

    btn.textContent = "🔒 Protect PDF";

}