import { renderToolShell, DROP_ICON } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;

export function renderUnlockView() {
  return renderToolShell({
    title: "Unlock PDF",
    desc: "Remove password protection from your PDF",
    icon: ICON,
    body: `
      <div class="compress-drop-zone unlock-drop-zone" id="unlockDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your protected PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">PDF files only</span>
        <input type="file" id="unlockInput" accept="application/pdf" multiple hidden>
      </div>

      <div id="unlockFileInfo" class="compress-file-info"></div>

      <div id="unlockPasswordSection" class="password-section" style="display:none;">

        <div class="password-header">
          <div>
            <h3>🔑 Enter PDF Password</h3>
            <p>Enter the password to unlock your PDF.</p>
          </div>
          <span class="security-badge">🛡 Secure</span>
        </div>

        <div class="password-input-group">
          <input type="password" id="unlockPassword" placeholder="Enter PDF password">
          <button type="button" class="toggle-password" data-target="unlockPassword">👁️</button>
        </div>

      </div>
    `,
    actionId: "unlockPdfBtn",
    actionLabel: "🔓 Unlock PDF",
  });
}