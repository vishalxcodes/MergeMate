import { renderToolShell } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19 3 3v-5.5"/><path d="m17 22 3-3"/><circle cx="9" cy="9" r="2"/></svg>`;

export function renderImageToPdfView() {
  return renderToolShell({
    title: "Images to PDF",
    desc: "Convert photos into one clean PDF document",
    icon: ICON,
    body: `
      <div id="imageDropZone" class="image-drop-zone">
        <div class="upload-icon" id="uploadIcon">🖼️</div>
        <h3 id="uploadTitle">Drop your images here</h3>
        <p id="uploadSubtitle">or browse from your device</p>
        <input type="file" id="imageInput" accept="image/*" multiple>
      </div>

      <div id="imagePreview"></div>
    `,
    actionId: "createPdfBtn",
    actionLabel: "Create PDF",
  });
}