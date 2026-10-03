import { renderToolShell, DROP_ICON, NOTE_SERVER_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>`;

export function renderExcelToPdfView() {
  return renderToolShell({
    title: "Excel to PDF",
    desc: "Convert your Excel spreadsheet into a PDF file",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="excelToPdfDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your Excel file here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">.xlsx or .xls file</span>
        <input type="file" id="excelToPdfInput" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
      </div>

      <div id="excelToPdfFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="excelToPdfFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="excelToPdfFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.pdf</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertExcelToPdfBtn",
    actionLabel: "Convert to PDF",
    actionDisabled: true,
    note: NOTE_SERVER_SIDE,
  });
}