import { decryptPDF } from "@pdfsmaller/pdf-decrypt";

let selectedPdfs = [];

export function initUnlockView() {

    const dropZone =
        document.getElementById("unlockDropZone");

    const input =
        document.getElementById("unlockInput");

    const fileInfo =
        document.getElementById("unlockFileInfo");

    const passwordSection =
        document.getElementById("unlockPasswordSection");


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

        const files =
            [...e.dataTransfer.files]
                .filter(file =>
                    file.type === "application/pdf"
                );


        if (files.length === 0) {

            showToast(
                "Please select PDF files",
                "error"
            );

            return;

        }


        selectPdfs(files);

    });


    input.addEventListener("change", (e) => {

        const files =
            [...e.target.files]
                .filter(file =>
                    file.type === "application/pdf"
                );


        if (files.length === 0) return;


        selectPdfs(files);


        input.value = "";

    });


    function selectPdfs(files) {

        selectedPdfs.push(...files);


        fileInfo.innerHTML = "";


        selectedPdfs.forEach((file, index) => {

            const card =
                document.createElement("div");


            card.className =
                "selected-pdf";


            card.innerHTML = `

                <span>📄</span>

                <strong>${file.name}</strong>

                <span>
                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                </span>

                <button
                    class="remove-unlock-file"
                    data-index="${index}"
                >
                    ×
                </button>

            `;


            fileInfo.appendChild(card);

        });


        passwordSection.style.display =
            "block";

    }


    fileInfo.addEventListener("click", (e) => {

        const removeBtn =
            e.target.closest(
                ".remove-unlock-file"
            );


        if (!removeBtn) return;


        const index =
            Number(removeBtn.dataset.index);


        selectedPdfs.splice(index, 1);


        fileInfo.innerHTML = "";


        selectedPdfs.forEach((file, index) => {

            const card =
                document.createElement("div");


            card.className =
                "selected-pdf";


            card.innerHTML = `

                <span>📄</span>

                <strong>${file.name}</strong>

                <span>
                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                </span>

                <button
                    class="remove-unlock-file"
                    data-index="${index}"
                >
                    ×
                </button>

            `;


            fileInfo.appendChild(card);

        });


        if (selectedPdfs.length === 0) {

            passwordSection.style.display =
                "none";

        }

    });


    document
        .getElementById("unlockPdfBtn")
        .addEventListener(
            "click",
            unlockPdf
        );


    document
        .querySelectorAll(".toggle-password")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        document.getElementById(
                            button.dataset.target
                        );


                    if (
                        input.type === "password"
                    ) {

                        input.type = "text";

                        button.textContent =
                            "🙈";

                    } else {

                        input.type =
                            "password";

                        button.textContent =
                            "👁️";

                    }

                }
            );

        });

}


async function unlockPdf() {

    if (selectedPdfs.length === 0) {

        showToast(
            "Please select a PDF first",
            "error"
        );

        return;

    }


    const password =
        document
            .getElementById(
                "unlockPassword"
            )
            .value;


    if (!password) {

        showToast(
            "Please enter the PDF password",
            "error"
        );

        return;

    }


    const btn =
        document.getElementById(
            "unlockPdfBtn"
        );


    btn.disabled = true;

    btn.textContent =
        "Unlocking PDF...";


    try {

        for (const file of selectedPdfs) {

            const pdfBytes =
                await file.arrayBuffer();


            const unlockedPdf =
                await decryptPDF(
                    new Uint8Array(
                        pdfBytes
                    ),
                    password
                );


            const blob =
                new Blob(
                    [unlockedPdf],
                    {
                        type:
                            "application/pdf"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const a =
                document.createElement(
                    "a"
                );


            a.href = url;


            a.download =
                `Unlocked-${file.name}`;


            a.click();


            URL.revokeObjectURL(
                url
            );

        }


        showToast(
            `${selectedPdfs.length} PDF(s) Unlocked Successfully`
        );


    } catch (error) {

        console.error(error);


        showToast(
            "Incorrect password or unsupported PDF",
            "error"
        );

    }


    btn.disabled = false;

    btn.textContent =
        "🔓 Unlock PDF";

}