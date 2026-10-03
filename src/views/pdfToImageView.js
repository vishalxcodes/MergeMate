import { renderToolShell, DROP_ICON } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="1.5"/><path d="m8 19 2.5-3 2 2L16 14l2 2"/></svg>`;

export function renderPdfToImageView() {
  return renderToolShell({
    title: "PDF to Image",
    desc: "Convert PDF pages into JPG or PNG images",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="pdfToImageDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single PDF document</span>
        <input type="file" id="pdfToImageInput" accept="application/pdf" hidden>
      </div>

      <div id="pdfToImageFileInfo" class="converter-file-info"></div>

      <div id="pdfToImageOptions" class="converter-options" style="display:none;">
        <div class="tm-panel">
          <div class="tm-two-col">
            <div class="tm-field">
              <label for="imageFormat">Image Format</label>
              <select id="imageFormat" class="tm-input">
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
            <div class="tm-field">
              <label for="imageQuality">Image Quality</label>
              <select id="imageQuality" class="tm-input">
                <option value="0.7">Standard</option>
                <option value="0.85">High</option>
                <option value="1">Maximum</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div id="pdfToImagePageInfo" class="converter-page-info"></div>
    `,
    actionId: "convertPdfToImageBtn",
    actionLabel: "Convert to Images",
    actionDisabled: true,
  });
}