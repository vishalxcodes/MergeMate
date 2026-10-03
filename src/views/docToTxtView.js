import { renderToolShell, DROP_ICON, NOTE_CLIENT_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>`;

export function renderDocToTxtView() {
  return renderToolShell({
    title: "DOCX to TXT",
    desc: "Convert your Word document into a plain text file",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="docToTxtDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your DOCX file here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single .docx file</span>
        <input type="file" id="docToTxtInput" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden>
      </div>

      <div id="docToTxtFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="docToTxtFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="docToTxtFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.txt</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertDocToTxtBtn",
    actionLabel: "Convert to TXT",
    actionDisabled: true,
    note: NOTE_CLIENT_SIDE,
  });
}