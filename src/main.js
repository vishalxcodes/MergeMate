import { registerSW } from "virtual:pwa-register";
registerSW({
  immediate: true,
});
import "./style.css";
import "./styles/converter.css";
import "./styles/admin.css";
import "./styles/navbar.css";
import "./styles/auth.css";
import "./styles/faq.css";
import './styles/dashboard-ui.css';
import './styles/tool-ui.css';
import './utils/faqToggle.js';
import './styles/student.css';
import { renderDashboard } from "./views/dashboard";
import { renderMergeView } from "./views/mergeView";
import { initMergeView } from "./controllers/mergeController";
import { renderSplitView } from "./views/splitView";
import { initSplitView } from "./controllers/splitController";
import { renderDeleteView } from "./views/deleteView";
import { initDeleteView } from "./controllers/deleteController";
import { renderExtractView } from "./views/extractView";
import { initExtractView } from "./controllers/extractController";
import { renderRotateView } from "./views/rotateView";
import { initRotateView } from "./controllers/rotateController";
import { renderStudentDashboard } from "./views/studentDashboard";
import { saveRecentTool } from "./utils/recentTool";
import { renderImageToPdfView } from "./views/imageToPdfView";
import { initImageToPdf } from "./controllers/imageToPdfController";
import { renderCompressView } from "./views/compressView";
import { initCompressView } from "./controllers/compressController";
import { renderProtectView } from "./views/protectView";
import { initProtectView } from "./controllers/protectController";
import { renderUnlockView } from "./views/unlockView";
import { initUnlockView } from "./controllers/unlockController";
import { renderDocToTxtView } from "./views/docToTxtView";
import { initDocToTxtView } from "./controllers/docToTxtController";
import { renderPdfToImageView } from "./views/pdfToImageView";
import { initPdfToImageView } from "./controllers/pdfToImageController";
import { renderDocToPdfView } from "./views/docToPdfView";
import { initDocToPdfView } from "./controllers/docToPdfController";
import { renderExcelToPdfView } from "./views/excelToPdfView";
import { initExcelToPdfView } from "./controllers/excelToPdfController";
import { renderPptToPdfView } from "./views/pptToPdfView";
import { initPptToPdfView } from "./controllers/pptToPdfController";
import { renderPdfToDocView } from "./views/pdfToDocView";
import { initPdfToDocView } from "./controllers/pdfToDocController";
import { renderPdfToXlsView } from "./views/pdfToXlsView";
import { initPdfToXlsView } from "./controllers/pdfToXlsController";
import { renderPdfToPptEditableView } from "./views/pdfToPptEditableView";
import { initPdfToPptEditableView } from "./controllers/pdfToPptEditableController";
import { renderImageCompressView } from "./views/imageCompressView";
import { initImageCompressView } from "./controllers/imageCompressController";
import { getFeedbackHTML } from './views/feedbackView.js';
import { initFeedbackForm } from './controllers/feedbackController.js';
import { initAdminPage } from './controllers/adminController.js';
import { renderSignup, renderLogin } from "./views/authView.js";
import { initSignup, initLogin } from "./controllers/authController.js";
import { renderHandwritingCalibrationView } from "./views/handwritingCalibrationView";
import { initHandwritingCalibrationView } from "./controllers/handwritingCalibrationController";





const app = document.querySelector("#app");
export async function checkLoggedIn() {
  try {
    const res = await fetch(`${AUTH_API}/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      updateNavbarForLoggedOut();
      return;
    }

    const data = await res.json();
    updateNavbarForLoggedIn(data.user);
  } catch (err) {
    updateNavbarForLoggedOut();
  }
}

function updateNavbarForLoggedIn(user) {
  const authSection = document.querySelector(".navbar-auth");
  if (!authSection) return;

  authSection.innerHTML = `
    <span class="navbar-username">👤 ${user.name}</span>
    <button id="logoutBtn">Logout</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch(`${AUTH_API}/logout`, {
      method: "POST",
      credentials: "include",
    });
    location.reload();
  });
}

function updateNavbarForLoggedOut() {
  // kuch nahi karna - default Sign In/Sign Up already dikh raha hai
}
const AUTH_API = window.location.hostname === "localhost"
  ? "http://localhost:3000/api/auth"
  : "https://mergemate-emgy.onrender.com/api/auth";
checkLoggedIn();

export function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 350);

    }, 2500);

}
window.showToast = showToast;
let currentMode = "professional";
showDashboard();
if (window.location.pathname === '/admin') {
  initAdminPage();
} else {
  showDashboard();
}

function showDashboard() {
    currentMode = "professional";

    document.body.classList.remove("student-mode");

    app.innerHTML = renderDashboard();

    app.classList.add("page-enter");

    setTimeout(() => {

        app.classList.remove("page-enter");

    },350);

    initTheme();
    initFeedback();

}

function initFeedback() {
  const feedbackFloatBtn = document.getElementById('feedbackFloatBtn');
  const feedbackOverlay = document.getElementById('feedbackModalOverlay');
  const feedbackCloseBtn = document.getElementById('feedbackModalClose');
  const feedbackSection = document.getElementById('feedbackSection');

  feedbackFloatBtn.addEventListener('click', () => {
    feedbackSection.innerHTML = getFeedbackHTML();
    initFeedbackForm();
    feedbackOverlay.classList.remove('hidden');
  });

  feedbackCloseBtn.addEventListener('click', () => {
    feedbackOverlay.classList.add('hidden');
  });

  feedbackOverlay.addEventListener('click', (e) => {
    if (e.target === feedbackOverlay) {
      feedbackOverlay.classList.add('hidden');
    }
  });
}


function showStudentDashboard() {

    app.innerHTML = renderStudentDashboard();
    document.body.classList.add("student-mode");

    initTheme();
    checkLoggedIn();

    app.classList.add("page-enter");
    setTimeout(() => { app.classList.remove("page-enter"); }, 350);
}

function initTheme() {

    const themeBtn = document.getElementById("themeBtn");

    if (!themeBtn) return;

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";

    } else {

        document.body.classList.remove("dark");
        themeBtn.textContent = "🌙";

    }

    themeBtn.onclick = () => {

        document.body.classList.toggle("dark");

        const dark = document.body.classList.contains("dark");

        themeBtn.textContent = dark ? "☀️" : "🌙";

        localStorage.setItem(
            "theme",
            dark ? "dark" : "light"
        );

    };

}

document.addEventListener("click", (e) => {

    if(e.target.closest('[data-tool="imagepdf"]')){

app.innerHTML=renderImageToPdfView();

initImageToPdf();

}

   if (e.target.closest("#studentModeBtn")) {

    const card = e.target.closest("#studentModeBtn");

    card.classList.add("click-scale");

   setTimeout(()=>{
    window.scrollTo(0, 0);

    currentMode = "student";

    showStudentDashboard();

},180);

}

if (e.target.closest("#exitStudentMode")) {

    setTimeout(()=>{

        showDashboard();

    },120);

}

    if (e.target.closest('[data-tool="merge"]')) {
        saveRecentTool("merge", "Merge Assignment");
        app.innerHTML = renderMergeView();

        initMergeView();

    }
    if (e.target.closest('[data-tool="split"]')) {
        saveRecentTool("split","Split PDF");
    app.innerHTML = renderSplitView();

    initSplitView();

}
if (e.target.closest('[data-tool="delete"]')) {
      saveRecentTool("delete","Delete Pages");
    app.innerHTML = renderDeleteView();

    initDeleteView();

}
if (e.target.closest('[data-tool="extract"]')) {
    saveRecentTool("extract","Extract Pages");
    app.innerHTML = renderExtractView();

    initExtractView();

}
if (e.target.closest('[data-tool="rotate"]')) {
    saveRecentTool("rotate","Rotate PDF");
    app.innerHTML = renderRotateView();

    initRotateView();

}
if (e.target.closest('[data-tool="compress"]')) {

    app.innerHTML = renderCompressView();
       initCompressView();

}
if (e.target.closest("#backBtn, .js-back")) {

    if (currentMode === "student") {

        showStudentDashboard();

        window.scrollTo(0, 0);

    } else {

        showDashboard();

    }

}

if (e.target.closest('[data-tool="protect"]')) {

    app.innerHTML = renderProtectView();

    initProtectView();


}
if (e.target.closest('[data-tool="unlock"]')) {

    app.innerHTML = renderUnlockView();

    initUnlockView();

}
if (e.target.closest('[data-tool="doc-to-txt"]')) {

    app.innerHTML = renderDocToTxtView();

    initDocToTxtView();

}
if (e.target.closest('[data-tool="pdf-to-image"]')) {

    app.innerHTML = renderPdfToImageView();

    initPdfToImageView();

}
if (e.target.closest('[data-tool="doc-to-pdf"]')) {

    app.innerHTML = renderDocToPdfView();

    initDocToPdfView();

}
if (e.target.closest('[data-tool="excel-to-pdf"]')) {

    app.innerHTML = renderExcelToPdfView();

    initExcelToPdfView();

}
if (e.target.closest('[data-tool="ppt-to-pdf"]')) {

    app.innerHTML = renderPptToPdfView();

    initPptToPdfView();

}
if (e.target.closest('[data-tool="pdf-to-doc"]')) {

    app.innerHTML = renderPdfToDocView();

    initPdfToDocView();

}
if (e.target.closest('[data-tool="pdf-to-xls"]')) {

    app.innerHTML = renderPdfToXlsView();

    initPdfToXlsView();

}
if (e.target.closest('[data-tool="pdf-to-ppt-editable"]')) {

    app.innerHTML = renderPdfToPptEditableView();

    initPdfToPptEditableView();

}
if (e.target.closest('[data-tool="image-compress"]')) {

    app.innerHTML = renderImageCompressView();

    initImageCompressView();

}
if (e.target.closest('[data-tool="signup"]')) {
    app.innerHTML = renderSignup();
    initSignup();
}

if (e.target.closest('[data-tool="login"]')) {
    app.innerHTML = renderLogin();
    initLogin();
}
if (e.target.closest(".faq-question")) {
    const item = e.target.closest(".faq-item");
    item.classList.toggle("active");
}
if (e.target.closest('[data-tool="handwriting-calibration"]')) {

    app.innerHTML = renderHandwritingCalibrationView();

    initHandwritingCalibrationView();

}
});
// Search filter
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'toolSearchInput') {
    const val = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.tool-card').forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(val) ? 'flex' : 'none';
    });
  }
});

// Category pills filter
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('cat-pill')) {
    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    const cat = e.target.getAttribute('data-category');
    document.querySelectorAll('.tool-card').forEach(card => {
      const cats = card.getAttribute('data-category') || '';
      card.style.display = (cat === 'all' || cats.includes(cat)) ? 'flex' : 'none';
    });
  }
});

// FAQ Accordion click
document.addEventListener('click', (e) => {
  const faqBtn = e.target.closest('.faq-question');
  if (faqBtn) {
    const faqItem = faqBtn.closest('.faq-item');
    faqItem.classList.toggle('active');
  }
});
