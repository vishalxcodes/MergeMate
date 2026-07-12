export function renderRotateView() {

    return `

    <div class="container">

        

        <div class="top-bar">
      <button id="backBtn">
            ← Back
        </button>



</div>

        <h1>🔄 Rotate PDF</h1>

<p>
Rotate selected pages in your PDF.
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
    id="rotatePageInput"
    placeholder="Rotate pages (e.g. 2,4,5-7)"
>

<select id="rotateAngle">
    <option value="90">90°</option>
    <option value="180">180°</option>
    <option value="270">270°</option>
</select>

<button id="rotateBtn">
    🔄 Rotate PDF
</button>

    </div>

    `;

}