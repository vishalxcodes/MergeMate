let selectedFile = null;

export function initPdfToPptEditableView() {

    const dropZone =
        document.getElementById("pdfToPptEditableDropZone");

    const input =
        document.getElementById("pdfToPptEditableInput");

    const fileInfo =
        document.getElementById("pdfToPptEditableFileInfo");

    const convertBtn =
        document.getElementById("convertPdfToPptEditableBtn");


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

                📽️

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
        convertPdfToPptEditable
    );


    async function convertPdfToPptEditable() {

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
                "https://mergemate-emgy.onrender.com/api/convert/pdf-to-ppt-editable",
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

        const pptBlob =
            await response.blob();

        const url =
            URL.createObjectURL(
                pptBlob
            );

        const a =
            document.createElement(
                "a"
            );

        const fileNameInput =
            document.getElementById(
                "pdfToPptEditableFileName"
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
                /\.pptx$/i,
                ""
            );

        a.href = url;

        a.download =
            fileName + ".pptx";

        a.click();

        URL.revokeObjectURL(url);

        showToast(
            "PDF converted to editable PowerPoint successfully"
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
        "Convert to PPT";

}};