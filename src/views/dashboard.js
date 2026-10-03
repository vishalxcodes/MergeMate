export function renderDashboard() {
  return `
    <nav class="main-navbar">
      <div class="navbar-logo" data-tool="dashboard">
        <img src="/icon-512.png" alt="MergeMate" onerror="this.src='/icon-192.png'" class="brand-img" />
        <span>MergeMate</span>
      </div>

      <div class="navbar-links">
        <a href="#" data-tool="merge">Merge</a>
        <a href="#" data-tool="split">Split</a>
        <a href="#" data-tool="compress">Compress</a>
        <a href="#" data-tool="extract">Extract</a>
        <a href="#" data-tool="handwriting-calibration" class="nav-handwriting">Handwriting ✨</a>
      </div>

      <div class="navbar-right">
        <a href="#" data-tool="student-mode" class="navbar-student-badge">
          🎓 <span>Student</span>
        </a>

        <button id="themeBtn" title="Toggle Theme" aria-label="Toggle Theme">
          🌙
        </button>

        <div class="navbar-auth">
          <button id="signInBtn" data-tool="login">Sign In</button>
          <button id="signUpBtn" data-tool="signup">Sign Up</button>
        </div>
      </div>
    </nav>

    <div class="container main-container">
      
      <!-- HERO HEADER -->
      <div class="hero-header">
        <div class="trust-row">
  <span class="trust-item trust-green">🛡️ Free Forever</span>
  <span class="trust-dot">·</span>
  <span class="trust-item trust-indigo">⚡ No Watermarks</span>
  <span class="trust-dot">·</span>
  <span class="trust-item trust-muted">🔓 No Signup Needed</span>
</div>
        <h1>Everything you need to <span class="gradient-text">Master Your PDFs</span></h1>
        <p class="hero-desc">
          Fast, free, and private PDF toolkit. Merge, split, compress, protect, convert, and create handwritten assignments all in one place.
        </p>

        <!-- SEARCH BAR -->
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="toolSearchInput" placeholder="Search 19 tools (e.g. merge, compress, handwriting, protect)..." />
        </div>

        <!-- CATEGORY TABS -->
        <div class="category-tabs">
          <button class="cat-pill active" data-category="all">All Tools <span class="pill-count">(19)</button>
          <button class="cat-pill" data-category="popular">Most Popular</button>
          <button class="cat-pill" data-category="organize">Organize & Edit</button>
          <button class="cat-pill" data-category="convert">Convert Documents</button>
          <button class="cat-pill" data-category="optimize">Compress & Resize</button>
          <button class="cat-pill" data-category="security">Lock & Protect</button>
          <button class="cat-pill" data-category="student">🎓 Student Hub</button>
        </div>
      </div>

      <!-- STUDENT MODE BANNER -->
      <!-- STUDENT MODE BANNER -->
<div class="student-section">
  <div class="student-mode-card">
    <div class="student-left">
      <div class="student-tag">🎓 Student Mode Workspace</div>
      <h2>Enter Student Mode</h2>
      <p>
        Tailored workflows for college, high school, and university students. Convert handwritten assignment notes to PDF, shrink files to meet Canvas &amp; Blackboard upload limits, and generate clean assignments.
      </p>
      <div class="student-checks">
        <span><i class="check-dot">✓</i> LMS Portals (Canvas, Moodle, Google Classroom)</span>
        <span><i class="check-dot">✓</i> Realistic Handwriting Assignments</span>
        <span><i class="check-dot">✓</i> Batch Photo to PDF</span>
      </div>
    </div>

    <div class="student-right">
      <a href="#" id="studentModeBtn" class="student-cta" data-tool="student-mode">
        <span>Activate Student Mode</span>
        <span class="cta-arrow">→</span>
      </a>
      <div class="student-chips">
        <a href="#" class="student-chip" data-tool="handwriting-calibration">✏️ Handwriting</a>
        <a href="#" class="student-chip" data-tool="compress">🗜️ LMS Shrink</a>
        <a href="#" class="student-chip" data-tool="imagepdf">🖼️ Photos → PDF</a>
        <a href="#" class="student-chip" data-tool="merge">📚 Merge Notes</a>
      </div>
    </div>
  </div>
</div>

      <!-- TOOLS SECTION TITLE -->
      <div class="tools-heading-bar">
        <div>
          <h2>PDF & Document Tools</h2>
          <p>Showing 19 tools · Click any tool to start immediately</p>
        </div>
        <span class="tool-count-badge">19 Fast Tools</span>
      </div>

      <!-- 19 TOOLS GRID -->
      <div class="tool-grid">

        <!-- 1. Images to PDF -->
        <div class="tool-card" data-tool="imagepdf" data-category="all,popular,convert,student">
          <div class="icon-wrap icon-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19 3 3v-5.5"/><path d="m17 22 3-3"/><circle cx="9" cy="9" r="2"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Images → PDF</h3>
              <span class="tool-tag">Instant</span>
            </div>
            <p>Convert photos into clean PDF document</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 2. Merge PDF -->
        <div class="tool-card" data-tool="merge" data-category="all,popular,organize,student">
          <div class="icon-wrap icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Merge PDF</h3>
              <span class="tool-tag">Popular</span>
            </div>
            <p>Combine multiple PDF files into one</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 3. Split PDF -->
        <div class="tool-card" data-tool="split" data-category="all,organize,student">
          <div class="icon-wrap icon-purple">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Split PDF</h3>
            </div>
            <p>Split one PDF into parts or page ranges</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 4. Delete Pages -->
        <div class="tool-card" data-tool="delete" data-category="all,organize">
          <div class="icon-wrap icon-rose">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Delete Pages</h3>
            </div>
            <p>Remove unwanted pages and keep only what matters</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 5. Extract Pages -->
        <div class="tool-card" data-tool="extract" data-category="all,organize,student">
          <div class="icon-wrap icon-emerald">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6m-3 3 3-3 3 3"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Extract Pages</h3>
            </div>
            <p>Create a new PDF from selected pages</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 6. Rotate PDF -->
        <div class="tool-card" data-tool="rotate" data-category="all,organize">
          <div class="icon-wrap icon-amber">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Rotate PDF</h3>
            </div>
            <p>Rotate upside-down or sideways pages</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 7. Compress PDF -->
        <div class="tool-card" data-tool="compress" data-category="all,popular,optimize,student">
          <div class="icon-wrap icon-indigo">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Compress PDF</h3>
              <span class="tool-tag">Up to 70%</span>
            </div>
            <p>Reduce PDF file size for easy uploads</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 8. Lock PDF -->
        <div class="tool-card" data-tool="protect" data-category="all,security">
          <div class="icon-wrap icon-rose">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Lock PDF</h3>
            </div>
            <p>Add secure password protection</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 9. Unlock PDF -->
        <div class="tool-card" data-tool="unlock" data-category="all,security">
          <div class="icon-wrap icon-emerald">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Unlock PDF</h3>
            </div>
            <p>Remove password protection from locked files</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 10. Handwriting Assignment -->
        <div class="tool-card" data-tool="handwriting-calibration" data-category="all,popular,student">
          <div class="icon-wrap icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Handwriting Assignment</h3>
              <span class="tool-tag">Student Special</span>
            </div>
            <p>Generate assignments in realistic handwriting</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 11. DOCX to TXT -->
        <div class="tool-card" data-tool="doc-to-txt" data-category="all,convert">
          <div class="icon-wrap icon-sky">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>DOCX to TXT</h3>
            </div>
            <p>Extract plain text from Word files</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 12. PDF to Image -->
        <div class="tool-card" data-tool="pdf-to-image" data-category="all,convert">
          <div class="icon-wrap icon-blue">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="1.5"/><path d="m8 19 2.5-3 2 2L16 14l2 2"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>PDF to Image</h3>
            </div>
            <p>Convert PDF pages to JPG or PNG</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 13. Compress Image -->
        <div class="tool-card" data-tool="image-compress" data-category="all,optimize">
          <div class="icon-wrap icon-amber">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M14 4v3m0-3h3m-3 0-4 4"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>Compress Image</h3>
            </div>
            <p>Reduce image file size with zero visible blur</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 14. DOCX to PDF -->
        <div class="tool-card" data-tool="doc-to-pdf" data-category="all,convert,student">
          <div class="icon-wrap icon-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>DOCX to PDF</h3>
            </div>
            <p>Convert Word documents to standardized PDF</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 15. XLSX to PDF -->
        <div class="tool-card" data-tool="excel-to-pdf" data-category="all,convert">
          <div class="icon-wrap icon-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>XLSX to PDF</h3>
            </div>
            <p>Convert Excel spreadsheets to PDF tables</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 16. PPT to PDF -->
        <div class="tool-card" data-tool="ppt-to-pdf" data-category="all,convert">
          <div class="icon-wrap icon-amber">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7 3 5"/><path d="M9 6V3"/><path d="m13 7 2-2"/><circle cx="9" cy="13" r="3"/><path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17"/><path d="M16 16h2"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>PPT to PDF</h3>
            </div>
            <p>Convert PowerPoint presentations to PDF handouts</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 17. PDF to DOCX -->
        <div class="tool-card" data-tool="pdf-to-doc" data-category="all,convert">
          <div class="icon-wrap icon-sky">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m5 11-3 3"/><path d="m5 17-3-3h10"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>PDF to DOCX</h3>
            </div>
            <p>Convert PDF into an editable Word document</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 18. PDF to XLS -->
        <div class="tool-card" data-tool="pdf-to-xls" data-category="all,convert">
          <div class="icon-wrap icon-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 12a9 3 0 0 0 5 2.69"/><path d="M21 9.3V5"/><path d="M3 5v14a9 3 0 0 0 6.47 2.88"/><path d="M12 12v4h4"/><path d="M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>PDF to XLS</h3>
            </div>
            <p>Convert PDF data tables into Excel sheet</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

        <!-- 19. PDF to PPT -->
        <div class="tool-card" data-tool="pdf-to-ppt-editable" data-category="all,convert">
          <div class="icon-wrap icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
          </div>
          <div class="tool-card-body">
            <div class="card-top-meta">
              <h3>PDF to PPT</h3>
            </div>
            <p>Convert PDF into an editable PowerPoint file</p>
          </div>
          <div class="card-footer">Open Tool →</div>
        </div>

      </div>

    </div>

   <!-- FAQ SECTION -->
    <section class="faq-section">
      <div class="faq-heading">
        <span class="faq-pill">❓ Got Questions?</span>
        <h2 class="faq-title">Frequently Asked Questions</h2>
        <p class="faq-subtitle">Everything you need to know about privacy and document processing on MergeMate.</p>
      </div>

      <div class="faq-list">

        <div class="faq-item active">
          <button class="faq-question">
            <span class="faq-q-icon faq-ic-amber">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            </span>
            <span class="faq-q-text">Is MergeMate really free to use?</span>
            <span class="faq-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </button>
          <div class="faq-answer">
            <p>Yes, 100%! All 19 tools on MergeMate are completely free. There are no hidden fees, no subscriptions, no credit card requirements, and no artificial watermarks stamped on your documents.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">
            <span class="faq-q-icon faq-ic-emerald">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            </span>
            <span class="faq-q-text">Are my files safe and private?</span>
            <span class="faq-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </button>
          <div class="faq-answer">
            <p>Tools like Rotate, Split, Delete and Extract run entirely in your browser, so those files never leave your device. Conversion tools (such as PDF to Word, Excel or PowerPoint) need heavier processing, so your file is sent securely to our server to complete the conversion.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">
            <span class="faq-q-icon faq-ic-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            <span class="faq-q-text">Do I need to create an account to use the tools?</span>
            <span class="faq-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </button>
          <div class="faq-answer">
            <p>No, you can use all PDF tools without signing up. Creating an account is optional and helps you access student presets.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">
            <span class="faq-q-icon faq-ic-rose">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
            </span>
            <span class="faq-q-text">What file size limits apply?</span>
            <span class="faq-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </button>
          <div class="faq-answer">
            <p>Files up to 50MB–100MB are supported comfortably. For strict college portals like Canvas with 5MB limits, use our Compress tool first.</p>
          </div>
        </div>

        <div class="faq-item">
          <button class="faq-question">
            <span class="faq-q-icon faq-ic-sky">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </span>
            <span class="faq-q-text">Can I use MergeMate on my phone or tablet?</span>
            <span class="faq-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </button>
          <div class="faq-answer">
            <p>Yes, MergeMate works on any smartphone, tablet, or laptop. You can snap camera photos of notebook assignments and convert them directly to PDF.</p>
          </div>
        </div>

      </div>
    </section>

    <!-- FOOTER -->
    <footer class="app-footer">
      <div class="ft-inner">

        <div class="ft-top">
          <div class="ft-brand" data-tool="dashboard">
            <img src="/icon-192.png" alt="MergeMate" onerror="this.src='/icon-192.png'" class="ft-logo" />
            <div class="ft-brand-text">
              <span class="ft-name">MergeMate</span>
              <span class="ft-tagline">Fast · Free · Privacy-Friendly</span>
            </div>
          </div>

          <nav class="ft-links">
            <a href="#" data-tool="merge">Merge PDF</a>
            <a href="#" data-tool="split">Split PDF</a>
            <a href="#" data-tool="compress">Compress PDF</a>
            <a href="#" data-tool="handwriting-calibration">Handwriting Assignment</a>
            <a href="#" data-tool="imagepdf">Images to PDF</a>
            <a href="#" data-tool="protect">Lock PDF</a>
          </nav>

          <div class="ft-social">
            <a href="https://www.instagram.com/mergemate.app?igsh=bHQzdXFtbGF6bmtl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://github.com/vishalxcodes/MergeMate" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
        </div>

        <div class="ft-bottom">
          <p class="ft-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            <span>Browser-based tools never upload your files. Converters process files securely on our server.</span>
          </p>
          <p class="ft-copy">&copy; 2026 MergeMate. Built with <span class="ft-heart">♥</span> for students and professionals.</p>
        </div>

      </div>
    </footer>

    <!-- FLOATING FEEDBACK BUTTON -->
    <button id="feedbackFloatBtn" aria-label="Give Feedback">💬</button>

    <!-- FEEDBACK MODAL -->
    <div id="feedbackModalOverlay" class="hidden">
      <div id="feedbackModalBox">
        <button id="feedbackModalClose" aria-label="Close">&times;</button>
        <div id="feedbackSection">
          <div class="feedback-container">
            <h2>Share Feedback</h2>
            <form id="feedbackForm">
              <label for="feedbackType">Category</label>
              <select id="feedbackType">
                <option value="feature">Feature Request</option>
                <option value="bug">Report an Issue</option>
                <option value="praise">Compliment</option>
                <option value="general">General</option>
              </select>

              <label for="feedbackMsg">Message</label>
              <textarea id="feedbackMsg" placeholder="Tell us how we can make MergeMate better..."></textarea>

              <button type="submit" id="feedbackSubmitBtn">Send Feedback</button>
              <p id="feedbackStatus"></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}