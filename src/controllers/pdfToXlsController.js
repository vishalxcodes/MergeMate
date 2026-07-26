let selectedFile = null;

export function initPdfToXlsView() {

    const dropZone =
        document.getElementById("pdfToXlsDropZone");

    const input =
        document.getElementById("pdfToXlsInput");

    const fileInfo =
        document.getElementById("pdfToXlsFileInfo");

    const convertBtn =
        document.getElementById("convertPdfToXlsBtn");


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
                file.name.toLowerCase().endsWith(".pdf")
            );

        if (!file) {

            showToast(
                "Please select a PDF file",
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
        convertPdfToXls
    );


    async function convertPdfToXls() {

    if (!selectedFile) return;

    convertBtn.disabled = true;

    convertBtn.textContent = "Converting...";

    try {

        const formData =
            new FormData();

        formData.append(
            "file",
            selectedFile
        );

        const response =
            await fetch(
                "https://mergemate-emgy.onrender.com/api/convert/pdf-to-excel",
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

        const excelBlob =
            await response.blob();

        const url =
            URL.createObjectURL(
                excelBlob
            );

        const a =
            document.createElement(
                "a"
            );

        const fileNameInput =
            document.getElementById(
                "pdfToXlsFileName"
            );

        let fileName =
            fileNameInput.value.trim();

        if (!fileName) {

            fileName =
                selectedFile.name
                    .replace(
                        /\.pdf$/i,
                        ""
                    );

        }

        fileName =
            fileName.replace(
                /\.xlsx$/i,
                ""
            );

        a.href = url;

        a.download =
            fileName + ".xlsx";

        a.click();

        URL.revokeObjectURL(url);

        showToast(
            "PDF converted to Excel successfully"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Could not convert this PDF file",
            "error"
        );

    }

    convertBtn.disabled = false;

    convertBtn.textContent =
        "Convert to XLS";

}};