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
             <button class="converter-action-btn hw-secondary-btn" data-tool="handwriting-generate">
          Already saved? Write an assignment →
              </button>

            <div id="hwReviewSection"></div>

        </div>

    `;

}


export function renderHwReviewGrid(blobs, expectedSequence) {

    const expectedCount = expectedSequence.length;
    const total = Math.max(blobs.length, expectedCount);

    const blankCount = blobs.filter(b => !b).length;
    const missingCount = blankCount + Math.max(0, expectedCount - blobs.length);
    const extraCount = Math.max(0, blobs.length - expectedCount);
    const statusOk = missingCount === 0 && extraCount === 0;

    let cells = "";

    for (let i = 0; i < total; i++) {

        const blob = blobs[i];
        const char = expectedSequence[i];
        const label = char === undefined ? "extra" : char;

        const cellClass = [
            "hw-glyph-cell",
            !blob ? "hw-glyph-missing" : "",
            char === undefined ? "hw-glyph-extra" : ""
        ].join(" ");

        cells += `

            <div class="${cellClass}">

                <div class="hw-glyph-img">
                    ${
                        blob
                            ? `<img src="data:image/png;base64,${blob}" alt="${label}">`
                            : `<span class="hw-glyph-missing-mark">?</span>`
                    }
                </div>

                <div class="hw-glyph-label">${label}</div>

                <div class="hw-cell-actions">
                    <button class="hw-cell-btn" data-hw-action="delete" data-index="${i}"
                        title="Remove this box (boxes after it move back by one)">✕</button>
                    <button class="hw-cell-btn" data-hw-action="insert" data-index="${i}"
                        title="Insert an empty slot here (boxes after it move forward by one)">＋</button>
                </div>

            </div>

        `;
    }

    let statusText = "All characters are in place. Please check each box below carefully.";

    if (extraCount > 0) {
        statusText = `${extraCount} extra box(es) at the end. Remove wrong or noise boxes with ✕ until every box matches its letter.`;
    } else if (missingCount > 0) {
        statusText = `${missingCount} character(s) missing. If a letter was not detected, press ＋ at the place where it should be, so the rest line up. Missing letters need a retake.`;
    }

    return `

        <div class="hw-review-section">

            <div class="hw-review-status ${statusOk ? "hw-status-ok" : "hw-status-warn"}">
                ${statusText}
            </div>

            <div class="hw-glyph-grid">
                ${cells}
            </div>

            <div class="hw-review-question">
                Does every box above show the correct matching character?
            </div>

            <div class="hw-review-actions">

                <button id="hwConfirmBtn" class="converter-action-btn" ${statusOk ? "" : "disabled"}>
                    Yes, Save My Handwriting
                </button>

                <button id="hwRetakeBtn" class="converter-action-btn hw-secondary-btn">
                    No, Retake Photo
                </button>

            </div>

        </div>

    `;

}