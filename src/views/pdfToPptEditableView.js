import { renderToolShell, DROP_ICON, NOTE_SERVER_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`;

export function renderPdfToPptEditableView() {
  return renderToolShell({
    title: "PDF to PPT (Editable)",
    desc: "Convert PDF into an editable PowerPoint presentation",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="pdfToPptEditableDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single PDF document</span>
        <input type="file" id="pdfToPptEditableInput" accept=".pdf,application/pdf" hidden>
      </div>

      <div id="pdfToPptEditableFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="pdfToPptEditableFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="pdfToPptEditableFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.pptx</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertPdfToPptEditableBtn",
    actionLabel: "Convert to PPT",
    actionDisabled: true,
    note: NOTE_SERVER_SIDE,
  });
}