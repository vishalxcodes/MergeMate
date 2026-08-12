export function renderDashboard() {
  return `
    <div class="container">

      <div class="header">
        <div>
          <h1>📄 MergeMate</h1>
          <p>Fast • Free • Private PDF Toolkit</p>
        </div>

       <button id="themeBtn" title="Toggle Theme">
    🌙
</button>
      </div>

      <div class="tool-grid">

        <div class="tool-card" data-tool="imagepdf">
          <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-down-icon lucide-image-down"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19 3 3v-5.5"/><path d="m17 22 3-3"/><circle cx="9" cy="9" r="2"/></svg>
          </div>
          <h3>Images → PDF</h3>
          <p>Convert photos into PDF</p>
        </div>

        <div class="tool-card" data-tool="merge">
          <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-merge-icon lucide-merge"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg></div>
          <h3>Merge PDF</h3>
          <p>Combine multiple PDF files</p>
        </div>

        <div class="tool-card" data-tool="split">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></div>
          <h3>Split PDF</h3>
          <p>Split one PDF into parts</p>
        </div>

        <div class="tool-card" data-tool="delete">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></div>
          <h3>Delete Pages</h3>
          <p>Remove unwanted pages</p>
        </div>

        <div class="tool-card" data-tool="extract">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6m-3 3 3-3 3 3"/></svg></div>
          <h3>Extract Pages</h3>
          <p>Create a new PDF</p>
        </div>

        <div class="tool-card" data-tool="rotate">
         <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg></div>
          <h3>Rotate PDF</h3>
          <p>Rotate selected pages</p>
        </div>

        <div class="tool-card" data-tool="compress">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg></div>
          <h3>Compress PDF</h3>
          <p>Reduce PDF file size</p>
        </div>

        <div class="tool-card" data-tool="protect">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <h3>Lock PDF</h3>
          <p>Add password protection</p>
        </div>

        <div class="tool-card" data-tool="unlock">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg></div>
          <h3>Unlock PDF</h3>
          <p>Remove password protection</p>
        </div>

        <div class="tool-card" data-tool="doc-to-txt">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg></div>
          <h3>DOCX to TXT</h3>
          <p>Extract plain text from Word files</p>
        </div>

        <div class="tool-card" data-tool="pdf-to-image">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="1.5"/><path d="m8 19 2.5-3 2 2L16 14l2 2"/></svg></div>
          <h3>PDF to Image</h3>
          <p>Convert PDF pages to JPG or PNG</p>
        </div>

        <div class="tool-card" data-tool="image-compress">
          <div class="icon"><svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M14 4v3m0-3h3m-3 0-4 4"/></svg></div>
          <h3>Compress Image</h3>
          <p>Reduce image file size</p>
        </div>

        <div class="tool-card" data-tool="doc-to-pdf">
          <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-input-icon lucide-file-input"><path d="M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg></div>
          <h3>DOCX to PDF</h3>
          <p>Convert Word documents to PDF</p>
        </div>

        <div class="tool-card" data-tool="excel-to-pdf">
          <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database-icon lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg></div>
          <h3>XLSX to PDF</h3>
          <p>Convert Excel spreadsheets to PDF</p>
        </div>

        <div class="tool-card" data-tool="ppt-to-pdf">
          <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-projector-icon lucide-projector"><path d="M5 7 3 5"/><path d="M9 6V3"/><path d="m13 7 2-2"/><circle cx="9" cy="13" r="3"/><path d="M11.83 12H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2.17"/><path d="M16 16h2"/></svg></div>
          <h3>PPT to PDF</h3>
          <p>Convert PowerPoint presentations to PDF</p>
        </div>

        <div class="tool-card" data-tool="pdf-to-doc">
          <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-output-icon lucide-file-output"><path d="M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m5 11-3 3"/><path d="m5 17-3-3h10"/></svg></div>
          <h3>PDF to DOCX</h3>
          <p>Convert PDF into an editable Word file</p>
        </div>

        <div class="tool-card" data-tool="pdf-to-xls">
          <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database-backup-icon lucide-database-backup"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 12a9 3 0 0 0 5 2.69"/><path d="M21 9.3V5"/><path d="M3 5v14a9 3 0 0 0 6.47 2.88"/><path d="M12 12v4h4"/><path d="M13 20a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16"/></svg></div>
          <h3>PDF to XLS</h3>
          <p>Convert PDF tables into Excel</p>
        </div>

       <div class="tool-card" data-tool="pdf-to-ppt-editable">
  <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-icon lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg></div>
  <h3>PDF to PPT</h3>
  <p>Convert PDF into an editable PowerPoint file</p>
</div>

        

      </div>
 
     <div class="student-section">
  <div class="student-mode-card" id="studentModeBtn">

  <div class="student-icon">
    🎓
  </div>

  <div class="student-info">

    <h2>Enter Student Mode</h2>

    <p>
      Assignments • Notes • Semester Work
    </p>

  </div>

  <div class="student-arrow">
    →
  </div>


</div>

    </div>
     <footer class="app-footer">
        <a href="https://www.instagram.com/mergemate.app?igsh=bHQzdXFtbGF6bmtl" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <a href="https://github.com/vishalxcodes/MergeMate" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </a>
        <p>&copy; 2026 MergeMate. All rights reserved.</p>
      </footer>

    </div>

    <!-- Floating Feedback Button -->
<button id="feedbackFloatBtn" aria-label="Give Feedback">💬</button>

<!-- Feedback Modal (hidden by default) -->
<div id="feedbackModalOverlay" class="hidden">
  <div id="feedbackModalBox">
    <button id="feedbackModalClose" aria-label="Close">&times;</button>
    <div id="feedbackSection"></div>
  </div>
</div>
  `;
}