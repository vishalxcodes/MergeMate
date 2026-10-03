// src/utils/faqToggle.js
// FAQ accordion. Registered ONCE globally, so it keeps working even when
// the dashboard is re-rendered (innerHTML) after coming back from a tool.
//
// It listens in the capture phase and stops the click there, so any older
// FAQ handler cannot toggle the same item a second time (which would
// instantly close it again).

document.addEventListener(
  "click",
  (e) => {
    const question = e.target.closest(".faq-question");
    if (!question) return;

    e.stopPropagation();

    const item = question.closest(".faq-item");
    if (!item) return;

    const willOpen = !item.classList.contains("active");

    // Accordion: close every other open item first
    document.querySelectorAll(".faq-item.active, .faq-item.open").forEach((el) => {
      el.classList.remove("active", "open");
      const q = el.querySelector(".faq-question");
      if (q) q.setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
      item.classList.add("active");
      question.setAttribute("aria-expanded", "true");
    }
  },
  true
);