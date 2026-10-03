export function renderHandwritingCalibrationView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    ✍️
                </div>

                <h1>Set Up Your Handwriting</h1>

                <p>
                    Write the sequence below on a plain sheet of paper, then upload a photo
                </p>

            </div>

            <div class="hw-instructions">

                <p>
                    Use a dark pen. Leave a small gap between each character.
                    Use block letters (no cursive). You can wrap to the next
                    line naturally as you run out of space.
                </p>

                <div class="hw-sequence-box">
                    a b c d e f g h i j k l m n o p q r s t u v w x y z<br>
                    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z<br>
                    0 1 2 3 4 5 6 7 8 9<br>
                    . , ? ! ' " -
                </div>

            </div>

            <div
                class="converter-drop-zone"
                id="hwDropZone"
            >

                <div class="drop-icon">
                    📷
                </div>

                <h3>
                    Drag & Drop Your Photo Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="hwInput"
                    accept=".jpg,.jpeg,.png,image/*"
                    hidden
                >

            </div>

            <div
                id="hwFileInfo"
                class="converter-file-info"
            ></div>

            <button
                id="hwProcessBtn"
                class="converter-action-btn"
                disabled
            >

                Process Photo

            </button>

            <div id="hwReviewSection"></div>

        </div>

    `;

}


export function renderHwReviewGrid(glyphs, expectedSequence, detectedCount, expectedCount) {

    const gridItems = expectedSequence.map(char => {

        const glyphBase64 = glyphs[char];

        const label = char === " " ? "space" : char;

        return `

            <div class="hw-glyph-cell ${glyphBase64 ? "" : "hw-glyph-missing"}">

                <div class="hw-glyph-img">
                    ${
                        glyphBase64
                            ? `<img src="data:image/png;base64,${glyphBase64}" alt="${label}">`
                            : `<span class="hw-glyph-missing-mark">?</span>`
                    }
                </div>

                <div class="hw-glyph-label">
                    ${label}
                </div>

            </div>

        `;

    }).join("");

    const statusOk = detectedCount === expectedCount;

    return `

        <div class="hw-review-section">

            <div class="hw-review-status ${statusOk ? "hw-status-ok" : "hw-status-warn"}">

                ${
                    statusOk
                        ? "All characters detected. Please check each box below carefully."
                        : `Detected ${detectedCount} of ${expectedCount} characters. Please review carefully - some may be missing, merged, or misaligned below.`
                }

            </div>

            <div class="hw-glyph-grid">
                ${gridItems}
            </div>

            <div class="hw-review-question">
                Does every box above show the correct matching character?
            </div>

            <div class="hw-review-actions">

                <button id="hwConfirmBtn" class="converter-action-btn">
                    Yes, Save My Handwriting
                </button>

                <button id="hwRetakeBtn" class="converter-action-btn hw-secondary-btn">
                    No, Retake Photo
                </button>

            </div>

        </div>

    `;

}