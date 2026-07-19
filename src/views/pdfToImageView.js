export function renderPdfToImageView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    🖼️
                </div>

                <h1>PDF to Image</h1>

                <p>
                    Convert PDF pages into JPG or PNG images
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="pdfToImageDropZone"
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
                    id="pdfToImageInput"
                    accept="application/pdf"
                    hidden
                >

            </div>

            <div
                id="pdfToImageFileInfo"
                class="converter-file-info"
            ></div>

            <div
                id="pdfToImageOptions"
                class="converter-options"
                style="display:none;"
            >

                <div class="converter-option-group">

                    <label for="imageFormat">
                        Image Format
                    </label>

                    <select id="imageFormat">

                        <option value="jpg">
                            JPG
                        </option>

                        <option value="png">
                            PNG
                        </option>

                    </select>

                </div>

                <div class="converter-option-group">

                    <label for="imageQuality">
                        Image Quality
                    </label>

                    <select id="imageQuality">

                        <option value="0.7">
                            Standard
                        </option>

                        <option value="0.85">
                            High
                        </option>

                        <option value="1">
                            Maximum
                        </option>

                    </select>

                </div>

            </div>

            <div
                id="pdfToImagePageInfo"
                class="converter-page-info"
            ></div>

            <button
                id="convertPdfToImageBtn"
                class="converter-action-btn"
                disabled
            >

                Convert to Images

            </button>

        </div>

    `;

}