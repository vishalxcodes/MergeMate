export function renderImageCompressView() {

    return `

        <div class="converter-container">

            <button id="backBtn" class="back-btn">
                ← Back
            </button>

            <div class="tool-header">

                <div class="tool-icon">
                    🖼️
                </div>

                <h1>Compress Image</h1>

                <p>
                    Reduce image file size while keeping quality
                </p>

            </div>

            <div
                class="converter-drop-zone"
                id="imageCompressDropZone"
            >

                <div class="drop-icon">
                    🖼️
                </div>

                <h3>
                    Drag & Drop Image Here
                </h3>

                <p>
                    or click to browse
                </p>

                <input
                    type="file"
                    id="imageCompressInput"
                    accept="image/*"
                    hidden
                >

            </div>

            <div
                id="imageCompressFileInfo"
                class="converter-file-info"
            ></div>

            <div class="converter-name-section">

                <label for="targetSize">
                    Target Size
                </label>

                <div class="converter-name-input">

                    <input
                        type="number"
                        id="targetSize"
                        placeholder="e.g. 200"
                        min="1"
                    >

                    <select id="targetSizeUnit">
                        <option value="KB">KB</option>
                        <option value="MB">MB</option>
                    </select>

                </div>

            </div>

            <button
                id="compressImageBtn"
                class="converter-action-btn"
                disabled
            >

                Compress Image

            </button>

        </div>

    `;

}