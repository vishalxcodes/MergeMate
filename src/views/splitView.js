import { renderToolShell } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`;

export function renderSplitView() {
  return renderToolShell({
    title: "Split PDF",
    desc: "Split one PDF into two parts at a page you choose",
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
          <label for="splitPage">Split after page</label>
          <input type="number" id="splitPage" class="tm-input" placeholder="e.g. 5" min="1">
        </div>
      </div>
    `,
    actionId: "splitBtn",
    actionLabel: "✂️ Split PDF",
  });
}