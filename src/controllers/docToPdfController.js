import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

let selectedFile = null;

export function initDocToPdfView() {

    const dropZone =
        document.getElementById("docToPdfDropZone");

    const input =
        document.getElementById("docToPdfInput");

    const fileInfo =
        document.getElementById("docToPdfFileInfo");

    const convertBtn =
        document.getElementById("convertDocToPdfBtn");


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
                file.name.toLowerCase().endsWith(".docx")
            );

        if (!file) {

            showToast(
                "Please select a DOCX file",
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

                📄

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
        convertDocToPdf
    );


    async function convertDocToPdf() {

    if (!selectedFile) return;

    convertBtn.disabled = true;

    convertBtn.textContent =
        "Converting...";

    try {

        const formData =
            new FormData();

        formData.append(
            "file",
            selectedFile
        );


        const response =
            await fetch(
                "http://localhost:3000/api/convert/docx-to-pdf",
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
                "docToPdfFileName"
            );


        let fileName =
            fileNameInput.value.trim();


        if (!fileName) {

            fileName =
                selectedFile.name
                    .replace(
                        /\.docx$/i,
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
            "DOCX converted to PDF successfully"
        );


    } catch (error) {

        console.error(error);


        showToast(

            "Could not convert this DOCX file",

            "error"

        );

    }


    convertBtn.disabled = false;


    convertBtn.textContent =
        "Convert to PDF";

}};