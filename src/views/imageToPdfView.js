export function renderImageToPdfView() {

return `

<div class="container">

<div class="top-bar">
<button id="backBtn">← Back</button>
</div>

<h1>🖼 Images to PDF</h1>

<p>
Convert multiple images into one PDF.
</p>

<div id="imageDropZone" class="image-drop-zone">

  <div class="upload-icon" id="uploadIcon">
    🖼️
</div>

<h3 id="uploadTitle">
    Drag & Drop Images Here
</h3>

<p id="uploadSubtitle">
    or click to browse
</p>

    <input
        type="file"
        id="imageInput"
        accept="image/*"
        multiple
    >

</div>



<div id="imagePreview"></div>

<button id="createPdfBtn">

Create PDF

</button>

</div>

`;

}