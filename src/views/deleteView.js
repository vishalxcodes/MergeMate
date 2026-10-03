import { renderToolShell } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

export function renderDeleteView() {
  return renderToolShell({
    title: "Delete Pages",
    desc: "Remove unwanted pages and keep only what matters",
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
          <label for="deletePageInput">Pages to delete</label>
          <input type="text" id="deletePageInput" class="tm-input" placeholder="e.g. 2,4,7-10">
        </div>
      </div>
    `,
    actionId: "deleteBtn",
    actionLabel: "🗑 Delete Pages",
  });
}