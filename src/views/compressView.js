import { renderToolShell, DROP_ICON } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;

export function renderCompressView() {
  return renderToolShell({
    title: "Compress PDF",
    desc: "Reduce PDF file size while keeping good quality",
    icon: ICON,
    body: `
      <div class="pdf-upload-zone" id="compressDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">PDF files only</span>
        <input type="file" id="compressInput" accept="application/pdf" multiple hidden>
      </div>

      <div id="compressFileInfo"></div>

      <div class="tm-panel compression-options">
        <h3>Choose Compression Level</h3>

        <div class="compression-grid">

          <label class="compression-card high">
            <input type="radio" name="compressionLevel" value="high">
            <div class="compression-icon">✨</div>
            <div class="compression-info">
              <strong>High Quality</strong>
              <span>Best clarity</span>
            </div>
            <div class="compression-check">✓</div>
          </label>

          <label class="compression-card balanced">
            <input type="radio" name="compressionLevel" value="balanced" checked>
            <div class="compression-icon">⚖️</div>
            <div class="compression-info">
              <strong>Balanced</strong>
              <span>Quality + smaller size</span>
            </div>
            <div class="compression-check">✓</div>
          </label>

          <label class="compression-card maximum">
            <input type="radio" name="compressionLevel" value="maximum">
            <div class="compression-icon">🚀</div>
            <div class="compression-info">
              <strong>Maximum Compression</strong>
              <span>Smallest file size</span>
            </div>
            <div class="compression-check">✓</div>
          </label>

          <label class="compression-card custom">
            <input type="radio" name="compressionLevel" value="custom">
            <div class="compression-icon">🎯</div>
            <div class="compression-info">
              <strong>Custom Target Size</strong>
              <span>Set your own limit</span>
            </div>
            <div class="compression-check">✓</div>
          </label>

        </div>

        <div id="targetSizeInputs" style="display: none; margin-top: 14px;">
          <div class="tm-inline">
            <input type="number" id="targetSizeValue" class="tm-input" placeholder="e.g. 500" min="1">
            <select id="targetSizeUnit" class="tm-input">
              <option value="KB">KB</option>
              <option value="MB" selected>MB</option>
            </select>
          </div>
        </div>
      </div>
    `,
    actionId: "compressBtn",
    actionLabel: "🗜️ Compress PDF",
    actionDisabled: true,
  });
}