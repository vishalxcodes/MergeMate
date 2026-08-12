export function getFeedbackHTML() {
  return `
    <div class="feedback-container">
      <h2>Feedback</h2>
      <form id="feedbackForm">
        <label for="feedbackType">Type</label>
        <select id="feedbackType" required>
          <option value="">Select type</option>
          <option value="Bug">Bug</option>
          <option value="Feature Request">Feature Request</option>
          <option value="General">General</option>
        </select>

        <label for="feedbackMessage">Message</label>
        <textarea id="feedbackMessage" rows="4" required placeholder="Tell us what's on your mind..."></textarea>

        <label for="feedbackEmail">Email (optional)</label>
        <input type="email" id="feedbackEmail" placeholder="you@example.com" />

        <button type="submit" id="feedbackSubmitBtn">Submit Feedback</button>
        <p id="feedbackStatus"></p>
      </form>
    </div>
  `;
}