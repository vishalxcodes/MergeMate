export function renderCompressView() {

    return `

    <div class="container">

        <div class="tool-header">

            <button id="backBtn">
                ← Back
            </button>

            <h1>🗜️ Compress PDF</h1>

            <p>
                Reduce PDF file size while keeping good quality
            </p>

        </div>

        <div class="pdf-upload-zone" id="compressDropZone">

            <div class="upload-icon">
                📄
            </div>

            <h2>
                Drop your PDF here
            </h2>

            <p>
                or click to browse
            </p>

            <input
    type="file"
    id="compressInput"
    accept="application/pdf"
    multiple
    hidden
>
        </div>

        <div id="compressFileInfo"></div>

     <div class="compression-options">

    <h3>Choose Compression Level</h3>

    <div class="compression-grid">

        <label class="compression-card high">

            <input
                type="radio"
                name="compressionLevel"
                value="high"
            >

            <div class="compression-icon">
                ✨
            </div>

            <div class="compression-info">

                <strong>High Quality</strong>

                <span>
                    Best clarity
                </span>

            </div>

            <div class="compression-check">
                ✓
            </div>

        </label>


        <label class="compression-card balanced">

            <input
                type="radio"
                name="compressionLevel"
                value="balanced"
                checked
            >

            <div class="compression-icon">
                ⚖️
            </div>

            <div class="compression-info">

                <strong>Balanced</strong>

                <span>
                    Quality + smaller size
                </span>

            </div>

            <div class="compression-check">
                ✓
            </div>

        </label>


        <label class="compression-card maximum">

            <input
                type="radio"
                name="compressionLevel"
                value="maximum"
            >

            <div class="compression-icon">
                🚀
            </div>

            <div class="compression-info">

                <strong>Maximum Compression</strong>

                <span>
                    Smallest file size
                </span>

            </div>

            <div class="compression-check">
                ✓
            </div>

        </label>

    </div>

</div>

<button
    id="compressBtn"
    disabled
>
    Compress PDF
</button>

    </div>

    `;

}