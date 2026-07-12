export function renderDeleteView() {

    return `

    <div class="container">

        

        <div class="top-bar">
      <button id="backBtn">
            ← Back
        </button>



</div>

     <h1>🗑 Delete Pages</h1>

<p>
Delete unwanted pages from your PDF.
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
    id="deletePageInput"
    placeholder="Delete pages (e.g. 2,4,7-10)"
>

<button id="deleteBtn">
    🗑 Delete Pages
</button>

    </div>

    `;

}