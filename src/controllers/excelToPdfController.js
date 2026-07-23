let selectedFile = null;

export function initExcelToPdfView() {

    fetch("https://mergemate-gotenberg.onrender.com/health").catch(() => {});

    const dropZone =
        document.getElementById("excelToPdfDropZone");

    const input =
        document.getElementById("excelToPdfInput");

    const fileInfo =
        document.getElementById("excelToPdfFileInfo");

    const convertBtn =
        document.getElementById("convertExcelToPdfBtn");


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
                file.name.toLowerCase().endsWith(".xlsx") ||
                file.name.toLowerCase().endsWith(".xls")
            );

        if (!file) {

            showToast(
                "Please select an Excel file",
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

        fetch("https://mergemate-gotenberg.onrender.com/health").catch(() => {});

        selectedFile = file;

        fileInfo.innerHTML = `

            <div class="converter-selected-file">

                📊

                <strong>
                    ${file.name}
                </strong>

                <span>
                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                </span>

            </div>

        `;

        convertBtn.disabled = false;

    }


    convertBtn.addEventListener(
        "click",
        convertExcelToPdf
    );


    async function convertExcelToPdf() {

    if (!selectedFile) return;

    convertBtn.disabled = true;

    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            if (attempt === 1) {
                convertBtn.textContent = "Converting...";
            } else {
                convertBtn.textContent = "⏳ Waking up engine, please wait...";
                showToast(
                    "MergeMate's conversion engine is waking up. This can take up to a minute on first use.",
                    "info"
                );
            }

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const response =
                await fetch(
                    "https://mergemate-emgy.onrender.com/api/convert/excel-to-pdf",
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
                    "Conversion failed"
                );

            }

            const pdfBlob =
                await response.blob();

            const url =
                URL.createObjectURL(
                    pdfBlob
                );

            const a =
                document.createElement(
                    "a"
                );

            const fileNameInput =
                document.getElementById(
                    "excelToPdfFileName"
                );

            let fileName =
                fileNameInput.value.trim();

            if (!fileName) {

                fileName =
                    selectedFile.name
                        .replace(
                            /\.(xlsx|xls)$/i,
                            ""
                        );

            }

            fileName =
                fileName.replace(
                    /\.pdf$/i,
                    ""
                );

            a.href = url;

            a.download =
                fileName + ".pdf";

            a.click();

            URL.revokeObjectURL(url);

            showToast(
                "Excel converted to PDF successfully"
            );

            break;

        } catch (error) {

            console.error(error);

            if (attempt === maxAttempts) {

                showToast(
                    "Conversion engine is waking up. Please click 'Convert to PDF' again in a few seconds.",
                    "error"
                );

            }

        }

    }

    convertBtn.disabled = false;

    convertBtn.textContent =
        "Convert to PDF";

}};