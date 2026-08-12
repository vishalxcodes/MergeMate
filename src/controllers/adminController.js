import { getAdminLoginHTML, getAdminDashboardHTML } from '../views/adminView.js';

export function initAdminPage() {
  const app = document.getElementById('app');
  app.innerHTML = getAdminLoginHTML();

  const form = document.getElementById('adminLoginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPasswordInput').value;
    const status = document.getElementById('adminLoginStatus');

    status.textContent = 'Loading...';

    try {
      const response = await fetch('https://mergemate-emgy.onrender.com/api/admin/feedback', {
        headers: { 'x-admin-password': password }
      });

      if (response.status === 401) {
        status.textContent = 'Wrong password';
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      app.innerHTML = getAdminDashboardHTML(data.feedback);
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong';
    }
  });
}