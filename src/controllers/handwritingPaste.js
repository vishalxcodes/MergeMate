// handwritingPaste.js - when the user pastes a TABLE copied from ChatGPT / a web page / Word,
// turn it into "| a | b |" rows so hw_parser can draw it as a table.  Normal pastes are left alone.

function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style").forEach((n) => n.remove());

  doc.querySelectorAll("table").forEach((t) => {
    const rows = [...t.querySelectorAll("tr")]
      .map((tr) => [...tr.querySelectorAll("th,td")]
        .map((c) => c.textContent.replace(/\s+/g, " ").trim().replace(/\|/g, "/")))
      .filter((r) => r.length);
    if (!rows.length) return;
    const lines = rows.map((r) => "| " + r.join(" | ") + " |");
    lines.splice(1, 0, "|" + rows[0].map(() => "---").join("|") + "|");
    t.replaceWith(doc.createTextNode("\n\n" + lines.join("\n") + "\n\n"));
  });

  doc.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
  doc.querySelectorAll("li").forEach((li) => li.prepend("- "));
  doc.querySelectorAll("p,div,li,h1,h2,h3,h4,h5,h6").forEach((n) => n.append("\n"));
  return doc.body.textContent.replace(/\n{3,}/g, "\n\n").trim();
}

export function attachTablePaste(textEl) {
  textEl.addEventListener("paste", (e) => {
    const html = e.clipboardData && e.clipboardData.getData("text/html");
    if (!html || !/<table/i.test(html)) return;            // no table in the clipboard: normal paste
    e.preventDefault();
    textEl.setRangeText(htmlToText(html), textEl.selectionStart, textEl.selectionEnd, "end");
    if (textEl.maxLength > 0 && textEl.value.length > textEl.maxLength) {
      textEl.value = textEl.value.slice(0, textEl.maxLength);
    }
    textEl.dispatchEvent(new Event("input", { bubbles: true }));   // updates the character counter
  });
}

export { htmlToText };