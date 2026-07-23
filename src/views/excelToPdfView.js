export function renderExcelToPdfView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    📊
                </div>

                <h1>Excel to PDF</h1>

                <p>
                    Convert your Excel spreadsheet into a PDF file
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="excelToPdfDropZone"
            >

                <div class="drop-icon">
                    📊
                </div>

                <h3>
                    Drag & Drop Excel File Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="excelToPdfInput"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    hidden
                >

            </div>

            <div
                id="excelToPdfFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="excelToPdfFileName">
                    File name
                </label>

                <div class="converter-name-input">

                    <input
                        type="text"
                        id="excelToPdfFileName"
                        placeholder="Enter file name"
                    >

                    <span>.pdf</span>

                </div>

            </div>

            <button
                id="convertExcelToPdfBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to PDF

            </button>

        </div>

    `;

}