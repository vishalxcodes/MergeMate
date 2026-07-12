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


const app = document.querySelector("#app");

showDashboard();

function showDashboard() {

    app.innerHTML = renderDashboard();

    initTheme();

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

    if (e.target.closest('[data-tool="merge"]')) {

        app.innerHTML = renderMergeView();

        initMergeView();

    }
    if (e.target.closest('[data-tool="split"]')) {

    app.innerHTML = renderSplitView();

    initSplitView();

}
if (e.target.closest('[data-tool="delete"]')) {

    app.innerHTML = renderDeleteView();

    initDeleteView();

}
if (e.target.closest('[data-tool="extract"]')) {

    app.innerHTML = renderExtractView();

    initExtractView();

}
if (e.target.closest('[data-tool="rotate"]')) {

    app.innerHTML = renderRotateView();

    initRotateView();

}

    if (e.target.id === "backBtn") {

        showDashboard();

    }

});
