import mammoth from "mammoth";

let selectedFile = null;

export function initDocToTxtView() {

    const dropZone =
        document.getElementById("docToTxtDropZone");

    const input =
        document.getElementById("docToTxtInput");

    const fileInfo =
        document.getElementById("docToTxtFileInfo");

    const convertBtn =
        document.getElementById("convertDocToTxtBtn");


    dropZone.addEventListener("click", () => {

        input.click();

    });


    input.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file) return;

        selectFile(file);

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
        .find(file => file.name.toLowerCase().endsWith(".docx"));

    if (!file) {

        showToast(
            "Please select a DOCX file",
            "error"
        );

        return;

    }

    selectFile(file);

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
        convertDocToTxt
    );


    async function convertDocToTxt() {

        if (!selectedFile) return;

        convertBtn.disabled = true;

        convertBtn.textContent =
            "Converting...";


        try {

            const arrayBuffer =
                await selectedFile.arrayBuffer();


            const result =
                await mammoth.extractRawText({
                    arrayBuffer
                });


            const text =
                result.value;


            const blob =
                new Blob(
                    [text],
                    { type: "text/plain" }
                );


            const url =
                URL.createObjectURL(blob);


            const a =
                document.createElement("a");


            a.href = url;


           const fileNameInput =
    document.getElementById("docToTxtFileName");

let fileName =
    fileNameInput.value.trim();

if (!fileName) {

    fileName =
        selectedFile.name
            .replace(/\.docx$/i, "");

}

fileName =
    fileName
        .replace(/\.txt$/i, "");

a.download =
    fileName + ".txt";


            a.click();


            URL.revokeObjectURL(url);


            showToast(
                "DOCX converted to TXT successfully"
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
            "Convert to TXT";

    }

}