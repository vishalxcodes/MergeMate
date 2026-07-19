export function renderDocToTxtView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📄
                </div>

                <h1>DOCX to TXT</h1>

                <p>
                    Convert your Word document into a plain text file
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="docToTxtDropZone"
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
                    id="docToTxtInput"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    hidden
                >

            </div>

            <div
                id="docToTxtFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

    <label for="docToTxtFileName">
        File name
    </label>

    <div class="converter-name-input">

        <input
            type="text"
            id="docToTxtFileName"
            placeholder="Enter file name"
        >

        <span>.txt</span>

    </div>

</div>
            <button
                id="convertDocToTxtBtn"
                class="converter-action-btn"
                disabled
            >
                Convert to TXT
            </button>

        </div>

    `;

}