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

        <div class="tool-card" data-tool="merge">
          <div class="icon">📄</div>
          <h3>Merge PDF</h3>
          <p>Combine multiple PDF files</p>
        </div>

        <div class="tool-card" data-tool="split">
          <div class="icon">✂️</div>
          <h3>Split PDF</h3>
          <p>Split one PDF into parts</p>
        </div>

        <div class="tool-card" data-tool="delete">
          <div class="icon">🗑</div>
          <h3>Delete Pages</h3>
          <p>Remove unwanted pages</p>
        </div>

        <div class="tool-card" data-tool="extract">
          <div class="icon">📑</div>
          <h3>Extract Pages</h3>
          <p>Create a new PDF</p>
        </div>

        <div class="tool-card" data-tool="rotate">
          <div class="icon">🔄</div>
          <h3>Rotate PDF</h3>
          <p>Rotate selected pages</p>
        </div>

             <div class="tool-card" data-tool="imagepdf">

<div class="icon">🖼</div>

<h3>Images → PDF</h3>

<p>Convert photos into PDF</p>

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

    </div>
  `;
}