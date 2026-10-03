import { renderToolShell } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6m-3 3 3-3 3 3"/></svg>`;

export function renderExtractView() {
  return renderToolShell({
    title: "Extract Pages",
    desc: "Create a new PDF from the pages you select",
    icon: ICON,
    body: `
      <div id="dropZone">
        <div class="tm-upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p>Drop your PDF here</p>
        <span>or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select a single PDF document</span>
        <input type="file" id="pdfInput" accept=".pdf">
      </div>

      <div id="fileList"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="extractPageInput">Pages to extract</label>
          <input type="text" id="extractPageInput" class="tm-input" placeholder="e.g. 1,3,5-7">
        </div>
      </div>
    `,
    actionId: "extractBtn",
    actionLabel: "📑 Extract Pages",
  });
}