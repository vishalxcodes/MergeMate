export function renderSignup() {
  return `
    <div class="auth-page">
      <div class="auth-card">
      <button class="auth-back-btn" id="authBackBtn">← Back</button>
        <h2>Create Account</h2>
        <form id="signupForm">
          <input type="text" id="signupName" placeholder="Full Name" required />
          <input type="email" id="signupEmail" placeholder="Email" required />
          <input type="password" id="signupPassword" placeholder="Password" required />
          <button type="submit">Sign Up</button>
        </form>
        <div class="google-signin-wrapper">
  <p class="auth-divider">or</p>
  <div id="googleSignInBtn"></div>
</div>
        <p class="auth-error" id="signupError"></p>
        <p class="auth-switch">Already have an account? <a href="#" data-tool="login">Sign In</a></p>
      </div>
    </div>
  `;
}

export function renderLogin() {
  return `
    <div class="auth-page">
      <div class="auth-card">
      <button class="auth-back-btn" id="authBackBtn">← Back</button>
        <h2>Welcome Back</h2>
        <form id="loginForm">
          <input type="email" id="loginEmail" placeholder="Email" required />
          <input type="password" id="loginPassword" placeholder="Password" required />
          <button type="submit">Sign In</button>
        </form>
        <div class="google-signin-wrapper">
  <p class="auth-divider">or</p>
  <div id="googleSignInBtn"></div>
</div>
        <p class="auth-error" id="loginError"></p>
        <p class="auth-switch">Don't have an account? <a href="#" data-tool="signup">Sign Up</a></p>
      </div>
    </div>
  `;
}