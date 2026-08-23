import { renderDashboard } from "../views/dashboard.js";
import { showToast } from "../main.js";
import { checkLoggedIn } from "../main.js";
import { renderLogin } from "../views/authView.js";
const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:3000/api/auth"
  : "https://mergemate-emgy.onrender.com/api/auth";
const GOOGLE_CLIENT_ID = "988990443593-79abim41p14ldqjkp2tn15krkkgqglrf.apps.googleusercontent.com";
const app = document.querySelector("#app");

function initGoogleButton() {
  if (!window.google) return;

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
  });

  window.google.accounts.id.renderButton(
    document.getElementById("googleSignInBtn"),
    { theme: "outline", size: "large", width: 300 }
  );
}

async function handleGoogleResponse(response) {
  try {
    const res = await fetch(`${API_BASE}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Google login failed");
      return;
    }

    showToast("Welcome, " + data.user.name + "!");
app.innerHTML = renderDashboard();
checkLoggedIn();
  } catch (err) {
    alert("Something went wrong with Google login.");
  }
}

export function initSignup() {
 document.getElementById("authBackBtn")?.addEventListener("click", () => {
  app.innerHTML = renderDashboard();
});
  const form = document.getElementById("signupForm");
  const errorEl = document.getElementById("signupError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.message || "Signup failed";
        return;
      }

    showToast("Account created! You can now sign in with your email and password.");
app.innerHTML = renderLogin();
initLogin();
    } catch (err) {
      errorEl.textContent = "Something went wrong. Try again.";
    }
  });
  initGoogleButton();
}

export function initLogin() {
document.getElementById("authBackBtn")?.addEventListener("click", () => {
  app.innerHTML = renderDashboard();
});
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.message || "Login failed";
        return;
      }

      showToast("Welcome back, " + data.user.name + "!");
app.innerHTML = renderDashboard();
checkLoggedIn();
    } catch (err) {
      errorEl.textContent = "Something went wrong. Try again.";
    }
  });
  initGoogleButton();
}