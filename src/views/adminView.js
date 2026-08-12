export function getAdminLoginHTML() {
  return `
    <div class="admin-container">
      <h2>Admin Login</h2>
      <form id="adminLoginForm">
        <input type="password" id="adminPasswordInput" placeholder="Enter admin password" required />
        <button type="submit">Login</button>
        <p id="adminLoginStatus"></p>
      </form>
    </div>
  `;
}

export function getAdminDashboardHTML(feedbackList) {
  const rows = feedbackList.map(fb => `
    <tr>
      <td>${fb.type}</td>
      <td>${fb.message}</td>
      <td>${fb.email || '-'}</td>
      <td>${new Date(fb.createdAt).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div class="admin-container">
      <h2>Feedback Dashboard (${feedbackList.length})</h2>
      <table class="admin-table">
        <thead>
          <tr><th>Type</th><th>Message</th><th>Email</th><th>Date</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}