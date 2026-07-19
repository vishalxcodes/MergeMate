export function renderDocToPdfView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📄
                </div>

                <h1>DOCX to PDF</h1>

                <p>
                    Convert your Word document into a PDF file
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="docToPdfDropZone"
            >

                <div class="drop-icon">
                    📄
                </div>

                <h3>
                    Drag & Drop DOCX Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="docToPdfInput"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    hidden
                >

            </div>

            <div
                id="docToPdfFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="docToPdfFileName">
                    File name
                </label>

                <div class="converter-name-input">

                    <input
                        type="text"
                        id="docToPdfFileName"
                        placeholder="Enter file name"
                    >

                    <span>.pdf</span>

                </div>

            </div>

            <button
                id="convertDocToPdfBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to PDF

            </button>

        </div>

    `;

}