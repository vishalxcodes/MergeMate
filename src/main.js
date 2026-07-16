import { registerSW } from "virtual:pwa-register";
registerSW({
  immediate: true,
});
import "./style.css";
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

const app = document.querySelector("#app");

function showToast(message, type = "success") {

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

function showDashboard() {
    currentMode = "professional";

    document.body.classList.remove("student-mode");

    app.innerHTML = renderDashboard();

    app.classList.add("page-enter");

    setTimeout(() => {

        app.classList.remove("page-enter");

    },350);

    initTheme();

}

function showStudentDashboard() {

    app.innerHTML = renderStudentDashboard();
    document.body.classList.add("student-mode");

    app.classList.add("page-enter");

    setTimeout(()=>{

        app.classList.remove("page-enter");

    },350);

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
if (e.target.id === "backBtn") {

    if (currentMode === "student") {

        showStudentDashboard();

        window.scrollTo(0, 0);

    } else {

        showDashboard();

    }

}

});

