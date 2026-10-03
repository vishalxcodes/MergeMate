import { renderToolShell, DROP_ICON } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M14 4v3m0-3h3m-3 0-4 4"/></svg>`;

export function renderImageCompressView() {
  return renderToolShell({
    title: "Compress Image",
    desc: "Reduce image file size while keeping quality",
    icon: ICON,
    body: `
      <div class="converter-drop-zone" id="imageCompressDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your image here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">JPG, PNG or WEBP</span>
        <input type="file" id="imageCompressInput" accept="image/*" hidden>
      </div>

      <div id="imageCompressFileInfo" class="converter-file-info"></div>

      <div class="tm-panel">
        <div class="tm-field">
          <label for="targetSize">Target Size</label>
          <div class="tm-inline">
            <input type="number" id="targetSize" class="tm-input" placeholder="e.g. 200" min="1">
            <select id="targetSizeUnit" class="tm-input">
              <option value="KB">KB</option>
              <option value="MB">MB</option>
            </select>
          </div>
        </div>
      </div>
    `,
    actionId: "compressImageBtn",
    actionLabel: "Compress Image",
    actionDisabled: true,
  });
}