export function renderPdfToDocView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📄
                </div>

                <h1>PDF to DOCX</h1>

                <p>
                    Convert your PDF into an editable Word file
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="pdfToDocDropZone"
            >

                <div class="drop-icon">
                    📄
                </div>

                <h3>
                    Drag & Drop PDF Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="pdfToDocInput"
                    accept=".pdf,application/pdf"
                    hidden
                >

            </div>

            <div
                id="pdfToDocFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="pdfToDocFileName">
                    File name
                </label>

                <div class="converter-name-input">

                    <input
                        type="text"
                        id="pdfToDocFileName"
                        placeholder="Enter file name"
                    >

                    <span>.docx</span>

                </div>

            </div>

            <button
                id="convertPdfToDocBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to DOCX

            </button>

        </div>

    `;

}