// src/utils/toolShell.js
// Shared card layout for every tool page (header + body + footer).
// Each view only supplies its own body HTML; IDs inside `body`
// stay exactly as the controller expects.

const DEFAULT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>`;

// Upload icon box used inside every drop zone
export const DROP_ICON = `
  <div class="tm-upload-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  </div>`;

export const NOTE_CLIENT_SIDE =
  "Your file is processed in your browser and never uploaded.";

export const NOTE_SERVER_SIDE =
  "Your file is sent securely to our server to complete this conversion.";

/**
 * @param {Object}  o
 * @param {string}  o.title
 * @param {string}  o.desc
 * @param {string}  [o.icon]          Inline <svg> markup
 * @param {string}  o.body            Tool-specific HTML
 * @param {string}  o.actionId        id of the main action button
 * @param {string}  o.actionLabel
 * @param {boolean} [o.actionDisabled] Start the action button disabled
 * @param {string}  [o.note]          Footer note
 */
export function renderToolShell({
  title,
  desc,
  icon = DEFAULT_ICON,
  body,
  actionId,
  actionLabel,
  actionDisabled = false,
  note = NOTE_CLIENT_SIDE,
}) {
  return `
    <div class="container">
      <div class="tm-card">

        <div class="tm-header">
          <div class="tm-icon">${icon}</div>
          <div class="tm-heading">
            <h1 class="tm-title">${title}</h1>
            <p class="tm-desc">${desc}</p>
          </div>
          <button class="tm-close js-back" aria-label="Close">✕</button>
        </div>

        <div class="tm-body">
          ${body}
        </div>

        <div class="tm-footer">
          <p class="tm-note">${note}</p>
          <div class="tm-actions">
            <button class="tm-cancel js-back">Cancel</button>
            <button id="${actionId}" class="tm-primary"${actionDisabled ? " disabled" : ""}>${actionLabel}</button>
          </div>
        </div>

      </div>
    </div>
  `;
}