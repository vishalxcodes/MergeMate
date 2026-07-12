export function renderMergeView() {

    return `

    <div class="container">

        

        <div class="top-bar">
      <button id="backBtn">
            ← Back
        </button>



</div>

        <h1>📄 Merge PDF</h1>

        <p>
            Merge multiple PDF files into one PDF.
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

        <button id="mergeBtn">
            Merge PDFs
        </button>

    </div>

    `;

}