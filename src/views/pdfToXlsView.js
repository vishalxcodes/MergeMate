import { renderToolShell, DROP_ICON, NOTE_SERVER_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 12a9 3 0 0 0 5 2.69"/><path d="M21 9.3V5"/><path d="M3 5v14a9 3 0 0 0 6.47 2.88"/><path d="M12 12v4h4"/><path d="M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16"/></svg>`;

export function renderPdfToXlsView() {
  return renderToolShell({
    title: "PDF to XLS",
    desc: "Convert PDF tables into an Excel file",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="pdfToXlsDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single PDF document</span>
        <input type="file" id="pdfToXlsInput" accept=".pdf,application/pdf" hidden>
      </div>

      <div id="pdfToXlsFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="pdfToXlsFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="pdfToXlsFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.xlsx</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertPdfToXlsBtn",
    actionLabel: "Convert to XLS",
    actionDisabled: true,
    note: NOTE_SERVER_SIDE,
  });
}