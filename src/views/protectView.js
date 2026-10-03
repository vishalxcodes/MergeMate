import { renderToolShell, DROP_ICON } from "../utils/toolShell.js";

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

export function renderProtectView() {
  return renderToolShell({
    title: "Lock PDF",
    desc: "Secure your PDF with password protection",
    icon: ICON,
    body: `
      <div class="compress-drop-zone protect-drop-zone" id="protectDropZone">
        ${DROP_ICON}
        <p class="drop-title">Drop your PDF here</p>
        <span class="drop-sub">or <em class="drop-link">browse from your device</em></span>
        <span class="drop-hint">PDF files only</span>
        <input type="file" id="protectInput" accept="application/pdf" multiple hidden>
      </div>

      <div id="protectFileInfo" class="compress-file-info"></div>

      <div id="protectPasswordSection" class="password-section" style="display:none;">

        <div class="password-header">
          <div>
            <h3>🔑 Set Password</h3>
            <p>Your PDF will be protected with strong encryption.</p>
          </div>
          <span class="security-badge">🛡 Secure</span>
        </div>

        <div class="password-input-group">
          <input type="password" id="protectPassword" placeholder="Enter password">
          <button type="button" class="toggle-password" data-target="protectPassword">👁️</button>
        </div>

        <div class="password-input-group">
          <input type="password" id="protectConfirmPassword" placeholder="Confirm password">
          <button type="button" class="toggle-password" data-target="protectConfirmPassword">👁️</button>
        </div>

      </div>
    `,
    actionId: "protectPdfBtn",
    actionLabel: "🔒 Lock PDF",
  });
}