import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import JSZip from "jszip";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


let selectedPdf = null;


export function initPdfToImageView() {

    const dropZone =
        document.getElementById("pdfToImageDropZone");

    const input =
        document.getElementById("pdfToImageInput");

    const fileInfo =
        document.getElementById("pdfToImageFileInfo");

    const options =
        document.getElementById("pdfToImageOptions");

    const pageInfo =
        document.getElementById("pdfToImagePageInfo");

    const convertBtn =
        document.getElementById("convertPdfToImageBtn");


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
                file.type === "application/pdf"
            );


        if (!file) {

            showToast(
                "Please select a PDF file",
                "error"
            );

            return;

        }


        selectPdf(file);

    });


    input.addEventListener("change", (e) => {

        const file = e.target.files[0];


        if (!file) return;


        selectPdf(file);


        input.value = "";

    });


    async function selectPdf(file) {

        selectedPdf = file;


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


        options.style.display = "block";


        convertBtn.disabled = false;


        try {

            const pdfBytes =
                new Uint8Array(
                    await file.arrayBuffer()
                );


            const pdf =
                await pdfjsLib.getDocument({
                    data: pdfBytes
                }).promise;


            pageInfo.textContent =
                `${pdf.numPages} page(s) found`;


        } catch (error) {

            console.error(error);


            showToast(
                "Could not read this PDF",
                "error"
            );

        }

    }


    convertBtn.addEventListener(
        "click",
        convertPdfToImages
    );


    async function convertPdfToImages() {

    if (!selectedPdf) return;

    convertBtn.disabled = true;

    convertBtn.textContent =
        "Converting...";

    try {

        const pdfBytes =
            new Uint8Array(
                await selectedPdf.arrayBuffer()
            );

        const pdf =
            await pdfjsLib.getDocument({
                data: pdfBytes
            }).promise;

        const format =
            document.getElementById(
                "imageFormat"
            ).value;

        const quality =
            Number(
                document.getElementById(
                    "imageQuality"
                ).value
            );

        const zip = new JSZip();

        const baseName =
            selectedPdf.name
                .replace(/\.pdf$/i, "");

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            convertBtn.textContent =
                `Converting ${pageNumber}/${pdf.numPages}...`;

            const page =
                await pdf.getPage(
                    pageNumber
                );

            const viewport =
                page.getViewport({
                    scale: 2
                });

            const canvas =
                document.createElement(
                    "canvas"
                );

            const context =
                canvas.getContext(
                    "2d"
                );

            canvas.width =
                viewport.width;

            canvas.height =
                viewport.height;

            await page.render({

                canvasContext:
                    context,

                viewport

            }).promise;

            const mimeType =
                format === "png"
                    ? "image/png"
                    : "image/jpeg";

            const imageBlob =
                await new Promise(
                    resolve => {

                        canvas.toBlob(

                            resolve,

                            mimeType,

                            quality

                        );

                    }
                );

            zip.file(
                `${baseName}-page-${pageNumber}.${format}`,
                imageBlob
            );

        }

        convertBtn.textContent =
            "Creating ZIP...";

        const zipBlob =
            await zip.generateAsync({
                type: "blob"
            });

        const url =
            URL.createObjectURL(
                zipBlob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            `${baseName}-images.zip`;

        a.click();

        URL.revokeObjectURL(url);

        showToast(
            "Images converted and ZIP downloaded successfully"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Could not convert this PDF",
            "error"
        );

    }

    convertBtn.disabled = false;

    convertBtn.textContent =
        "Convert to Images";

}

}