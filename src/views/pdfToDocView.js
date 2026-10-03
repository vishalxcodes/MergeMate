import { renderToolShell, DROP_ICON, NOTE_SERVER_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m5 11-3 3"/><path d="m5 17-3-3h10"/></svg>`;

export function renderPdfToDocView() {
  return renderToolShell({
    title: "PDF to DOCX",
    desc: "Convert your PDF into an editable Word file",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="pdfToDocDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single PDF document</span>
        <input type="file" id="pdfToDocInput" accept=".pdf,application/pdf" hidden>
      </div>

      <div id="pdfToDocFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="pdfToDocFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="pdfToDocFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.docx</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertPdfToDocBtn",
    actionLabel: "Convert to DOCX",
    actionDisabled: true,
    note: NOTE_SERVER_SIDE,
  });
}