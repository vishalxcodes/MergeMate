import { renderToolShell, DROP_ICON, NOTE_SERVER_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>`;

export function renderDocToPdfView() {
  return renderToolShell({
    title: "DOCX to PDF",
    desc: "Convert your Word document into a PDF file",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="docToPdfDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your DOCX file here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single .docx file</span>
        <input type="file" id="docToPdfInput" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden>
      </div>

      <div id="docToPdfFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="docToPdfFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="docToPdfFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.pdf</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertDocToPdfBtn",
    actionLabel: "Convert to PDF",
    actionDisabled: true,
    note: NOTE_SERVER_SIDE,
  });
}