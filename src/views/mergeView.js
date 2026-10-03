import { renderToolShell } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>`;

export function renderMergeView() {
  return renderToolShell({
    title: "Merge PDF",
    desc: "Combine multiple PDF files into one document",
    icon: ICON,
    body: `
      <div id="dropZone">
        <div class="tm-upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p>Drop your PDFs here</p>
        <span>or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">Select two or more PDF files</span>
        <input type="file" id="pdfInput" accept=".pdf" multiple>
      </div>

      <div id="fileList"></div>

      <div class="progress-container" id="progressContainer">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <div class="progress-text" id="progressText">Preparing...</div>
    `,
    actionId: "mergeBtn",
    actionLabel: "Merge PDFs",
  });
}