export function renderSplitView() {

    return `

    <div class="container">

        

        <div class="top-bar">
      <button id="backBtn">
            ← Back
        </button>



</div>

        <h1>✂️ Split PDF</h1>

<p>
Split one PDF into two parts.
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
    type="number"
     id="splitPage"
     placeholder="Split after page"
      >

<button id="splitBtn">
✂️ Split PDF
</button>

    </div>

    `;

}