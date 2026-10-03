import { renderNavbar } from "./navbar.js";

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const svg = (inner, size = 24) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const ICON_PEN = svg(`<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>`, 30);
const ICON_MERGE = svg(`<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/>`);
const ICON_COMPRESS = svg(`<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>`);
const ICON_CAMERA = svg(`<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>`);
const ICON_PACKAGE = svg(`<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`);

// user = optional { name } (wired up in the login step). Falls back to "Student".
export function renderStudentDashboard(user = null) {
  const firstName = user && user.name ? esc(String(user.name).trim().split(" ")[0]) : "Student";

  return `
    ${renderNavbar({ studentActive: true })}

    <div class="container main-container sd-page">

      <!-- HERO -->
      <section class="sd-hero">
        <div class="sd-hero-left">
          <span class="sd-tag">🎓 Student Mode</span>
          <h1>Welcome back, ${firstName} 👋</h1>
          <p>Choose a task and let's get your work done faster.</p>
        </div>
        <a href="#" id="exitStudentMode" class="sd-exit">← Professional Mode</a>
      </section>

      <!-- FEATURED: HANDWRITING -->
      <div class="sd-featured" data-tool="handwriting-calibration">
        <div class="sd-feat-icon">${ICON_PEN}</div>

        <div class="sd-feat-body">
          <span class="tool-tag">Student Special</span>
          <h2>Handwriting Assignment</h2>
          <p>Turn typed text into neat, realistic handwritten pages in your own handwriting style.</p>
          <span class="sd-feat-cta">Open Tool <span class="card-arrow">→</span></span>
        </div>

        <div class="sd-paper" aria-hidden="true">
          <p>Dear Professor,</p>
          <p>Please find my assignment attached.</p>
          <p>Thank you!</p>
        </div>
      </div>

      <!-- QUICK TOOLS -->
      <div class="tools-heading-bar">
        <div>
          <h2>Quick Tools</h2>
          <p>Everything you need for your submissions</p>
        </div>
      </div>

      <div class="tool-grid">

        <div class="tool-card" data-tool="merge">
          <div class="icon-wrap icon-blue">${ICON_MERGE}</div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Merge Assignment</h3>
              <span class="tool-tag">Popular</span>
            </div>
            <p>Combine assignment PDFs into one file</p>
          </div>
          <div class="card-footer"><span>Open Tool</span><span class="card-arrow">→</span></div>
        </div>

        <div class="tool-card" data-tool="compress">
          <div class="icon-wrap icon-indigo">${ICON_COMPRESS}</div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Compress Notes</h3>
              <span class="tool-tag">Up to 70%</span>
            </div>
            <p>Reduce PDF size to meet upload limits</p>
          </div>
          <div class="card-footer"><span>Open Tool</span><span class="card-arrow">→</span></div>
        </div>

        <div class="tool-card" data-tool="imagepdf">
          <div class="icon-wrap icon-emerald">${ICON_CAMERA}</div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Homework Scanner</h3>
              <span class="tool-tag">Instant</span>
            </div>
            <p>Turn photos of your notebook into a PDF</p>
          </div>
          <div class="card-footer"><span>Open Tool</span><span class="card-arrow">→</span></div>
        </div>

        <div class="tool-card is-soon" aria-disabled="true">
          <div class="icon-wrap icon-amber">${ICON_PACKAGE}</div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Semester Pack</h3>
              <span class="tool-tag">Coming Soon</span>
            </div>
            <p>Bundle everything into one final submission</p>
          </div>
          <div class="card-footer"><span>Coming soon</span></div>
        </div>

      </div>

      <!-- TIPS -->
      <div class="sd-tips">
        <div class="sd-tip">
          <span>📏</span>
          <p>Portal limit 5MB? Shrink your PDF with <b>Compress Notes</b> before uploading.</p>
        </div>
        <div class="sd-tip">
          <span>📸</span>
          <p>Click photos of your notebook and turn them into one PDF with <b>Homework Scanner</b>.</p>
        </div>
        <div class="sd-tip">
          <span>🗂️</span>
          <p>Put pages in the right order with <b>Merge Assignment</b> and submit just once.</p>
        </div>
      </div>

    </div>
  `;
}