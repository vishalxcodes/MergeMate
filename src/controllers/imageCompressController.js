let selectedFile = null;

export function initImageCompressView() {

    const dropZone =
        document.getElementById("imageCompressDropZone");

    const input =
        document.getElementById("imageCompressInput");

    const fileInfo =
        document.getElementById("imageCompressFileInfo");

    const compressBtn =
        document.getElementById("compressImageBtn");

    


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
                file.type.startsWith("image/")
            );

        if (!file) {

            showToast(
                "Please select an image file",
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

                🖼️

                <strong>
                    ${file.name}
                </strong>

                <span>
                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                </span>

            </div>

        `;

        compressBtn.disabled = false;

    }


    compressBtn.addEventListener(
        "click",
        compressImage
    );


    function compressImage() {

        if (!selectedFile) return;

        const targetSizeInput =
            document.getElementById("targetSize");

        const targetSizeUnit =
            document.getElementById("targetSizeUnit").value;

        const targetSizeValue =
            parseFloat(targetSizeInput.value);

        if (!targetSizeValue || targetSizeValue <= 0) {

            showToast(
                "Please enter a valid target size",
                "error"
            );

            return;

        }

        const targetBytes =
            targetSizeUnit === "MB"
                ? targetSizeValue * 1024 * 1024
                : targetSizeValue * 1024;

        compressBtn.disabled = true;

        compressBtn.textContent = "Compressing...";

        const img = new Image();

        const reader = new FileReader();

        reader.onload = (e) => {

            img.src = e.target.result;

            img.onload = () => {

                const canvas =
                    document.createElement("canvas");

                canvas.width = img.width;

                canvas.height = img.height;

                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(img, 0, 0);

                findBestQuality(canvas, targetBytes);

            };

        };

        reader.readAsDataURL(selectedFile);

    }


    function findBestQuality(canvas, targetBytes) {

        let low = 0.05;

        let high = 1.0;

        let bestBlob = null;

        let attempts = 0;

        const maxAttempts = 12;

        function tryQuality(quality) {

            canvas.toBlob(

                (blob) => {

                    attempts++;

                    if (!blob) {

                        finish(bestBlob);

                        return;

                    }

                    const currentDiff = Math.abs(blob.size - targetBytes);
                    const bestDiff = bestBlob === null ? Infinity : Math.abs(bestBlob.size - targetBytes);
                    const isCloser = currentDiff - bestDiff;

                    if (bestBlob === null || isCloser < 0) {

                        bestBlob = blob;

                    }

                    if (attempts >= maxAttempts) {

                        finish(bestBlob);

                        return;

                    }

                    if (blob.size > targetBytes) {

                        high = quality;

                    } else {

                        low = quality;

                    }

                    const nextQuality =
                        (low + high) / 2;

                    tryQuality(nextQuality);

                },

                "image/jpeg",

                quality

            );

        }


        function finish(blob) {

            if (!blob) {

                showToast(
                    "Could not compress this image",
                    "error"
                );

                compressBtn.disabled = false;

                compressBtn.textContent = "Compress Image";

                return;

            }

            const achievedKB = (blob.size / 1024).toFixed(1);
            const targetKB = (targetBytes / 1024).toFixed(1);
            const diffPercent = Math.abs(blob.size - targetBytes) / targetBytes * 100;

            const url =
                URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            const originalName =
                selectedFile.name.replace(
                    /\.[^/.]+$/,
                    ""
                );

            a.href = url;

            a.download =
                originalName + "-compressed.jpg";

            a.click();

            URL.revokeObjectURL(url);

            if (diffPercent > 15) {

                showToast(
                    `Closest possible: ${achievedKB} KB (target was ${targetKB} KB — this image cannot compress smaller without quality loss)`,
                    "info"
                );

            } else {

                showToast(
                    `Compressed to ${achievedKB} KB successfully`
                );

            }

            compressBtn.disabled = false;

            compressBtn.textContent = "Compress Image";

        }


        canvas.toBlob(

            (maxBlob) => {

                if (maxBlob && maxBlob.size <= targetBytes) {

                    finish(maxBlob);

                    return;

                }

                tryQuality((low + high) / 2);

            },

            "image/jpeg",

            1.0

        );

    }

    }

