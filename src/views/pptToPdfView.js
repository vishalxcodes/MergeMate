export function renderPptToPdfView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📽️
                </div>

                <h1>PPT to PDF</h1>

                <p>
                    Convert your PowerPoint presentation into a PDF file
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="pptToPdfDropZone"
            >

                <div class="drop-icon">
                    📽️
                </div>

                <h3>
                    Drag & Drop PPT File Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="pptToPdfInput"
                    accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    hidden
                >

            </div>

            <div
                id="pptToPdfFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="pptToPdfFileName">
                    File name
                </label>

                <div class="converter-name-input">

                    <input
                        type="text"
                        id="pptToPdfFileName"
                        placeholder="Enter file name"
                    >

                    <span>.pdf</span>

                </div>

            </div>

            <button
                id="convertPptToPdfBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to PDF

            </button>

        </div>

    `;

}