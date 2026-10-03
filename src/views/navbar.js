// src/views/navbar.js
// Same navbar as the homepage, reusable on other screens (e.g. Student Dashboard).
// Auth buttons are replaced by checkLoggedIn() after render, same as before.

export function renderNavbar({ studentActive = false } = {}) {
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
        <a href="#" data-tool="student-mode" class="navbar-student-badge${studentActive ? " active" : ""}">
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
  `;
}