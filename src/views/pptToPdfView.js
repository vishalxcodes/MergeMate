import { renderToolShell, DROP_ICON, NOTE_SERVER_SIDE } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7 3 5"/><path d="M9 6V3"/><path d="m13 7 2-2"/><circle cx="9" cy="13" r="3"/><path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17"/><path d="M16 16h2"/></svg>`;

export function renderPptToPdfView() {
  return renderToolShell({
    title: "PPT to PDF",
    desc: "Convert your PowerPoint presentation into a PDF file",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="pptToPdfDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PPT file here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">.pptx or .ppt file</span>
        <input type="file" id="pptToPdfInput" accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation" hidden>
      </div>

      <div id="pptToPdfFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="pptToPdfFileName">File name</label>
          <div class="tm-inline">
            <input type="text" id="pptToPdfFileName" class="tm-input" placeholder="Enter file name">
            <span class="tm-suffix">.pdf</span>
          </div>
        </div>
      </div>
    `,
    actionId: "convertPptToPdfBtn",
    actionLabel: "Convert to PDF",
    actionDisabled: true,
    note: NOTE_SERVER_SIDE,
  });
}