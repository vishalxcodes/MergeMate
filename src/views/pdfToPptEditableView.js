export function renderPdfToPptEditableView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📽️
                </div>

                <h1>PDF to PPT (Editable)</h1>

                <p>
                    Convert PDF into an editable PowerPoint presentation
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="pdfToPptEditableDropZone"
            >

                <div class="drop-icon">
                    📽️
                </div>

                <h3>
                    Drag & Drop PDF Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="pdfToPptEditableInput"
                    accept=".pdf,application/pdf"
                    hidden
                >

            </div>

            <div
                id="pdfToPptEditableFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="pdfToPptEditableFileName">
                    File name
                </label>

                <div class="converter-name-input">

                    <input
                        type="text"
                        id="pdfToPptEditableFileName"
                        placeholder="Enter file name"
                    >

                    <span>.pptx</span>

                </div>

            </div>

            <button
                id="convertPdfToPptEditableBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to PPT

            </button>

        </div>

    `;

}