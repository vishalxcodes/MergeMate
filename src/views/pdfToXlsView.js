export function renderPdfToXlsView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📊
                </div>

                <h1>PDF to XLS</h1>

                <p>
                    Convert PDF tables into an Excel file
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="pdfToXlsDropZone"
            >

                <div class="drop-icon">
                    📊
                </div>

                <h3>
                    Drag & Drop PDF Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="pdfToXlsInput"
                    accept=".pdf,application/pdf"
                    hidden
                >

            </div>

            <div
                id="pdfToXlsFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="pdfToXlsFileName">
                    File name
                </label>

                <div class="converter-name-input">

                    <input
                        type="text"
                        id="pdfToXlsFileName"
                        placeholder="Enter file name"
                    >

                    <span>.xlsx</span>

                </div>

            </div>

            <button
                id="convertPdfToXlsBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to XLS

            </button>

        </div>

    `;

}