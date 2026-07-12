export function renderExtractView() {

    return `

    <div class="container">

        

        <div class="top-bar">
      <button id="backBtn">
            ← Back
        </button>



</div>

        <h1>📑 Extract Pages</h1>

<p>
Extract selected pages into a new PDF.
</p>

        <div id="dropZone">

            <p>📂 Drag & Drop PDFs Here</p>

            <span>or click to browse</span>

            <input
                type="file"
                id="pdfInput"
                accept=".pdf"
                multiple
            >

        </div>

        <div id="fileList"></div>

        <input
    type="text"
    id="extractPageInput"
    placeholder="Extract pages (e.g. 1,3,5-7)"
>

<button id="extractBtn">
    📑 Extract Pages
</button>

    </div>

    `;

}