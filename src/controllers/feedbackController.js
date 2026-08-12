export function initFeedbackForm() {
  const form = document.getElementById('feedbackForm');
  const status = document.getElementById('feedbackStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const type = document.getElementById('feedbackType').value;
    const message = document.getElementById('feedbackMessage').value;
    const email = document.getElementById('feedbackEmail').value;

    status.textContent = 'Submitting...';

    try {
      const response = await fetch('https://mergemate-emgy.onrender.com/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type, message, email })
});

      if (!response.ok) throw new Error('Submit failed');

      status.textContent = 'Thanks for your feedback!';
      form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong. Please try again.';
    }
  });
}