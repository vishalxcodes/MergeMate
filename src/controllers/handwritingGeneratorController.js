const HW_API = window.location.hostname === "localhost"
    ? "http://localhost:3000/api/handwriting"
    : "https://mergemate-emgy.onrender.com/api/handwriting";

let lastUrl = null;

export function initHandwritingGeneratorView() {
// Node server soya ho to page khulte hi jaga do (jawab ignore)
    fetch(`${HW_API}/me`, { credentials: "include" }).catch(() => {});
    
    const textEl = document.getElementById("hwGenText");
    const countEl = document.getElementById("hwGenCount");
    const btn = document.getElementById("hwGenBtn");
    const result = document.getElementById("hwGenResult");

    textEl.addEventListener("input", () => {
        countEl.textContent = `${textEl.value.length} / 6000`;
        btn.disabled = textEl.value.trim().length === 0;
    });

    const headingBtn = document.getElementById("hwGenHeadingBtn");
const autoQ = document.getElementById("hwGenAutoQ");

headingBtn.addEventListener("click", () => {
    const v = textEl.value;
    const s = textEl.selectionStart;
    const start = s === 0 ? 0 : v.lastIndexOf("\n", s - 1) + 1;
    let end = v.indexOf("\n", textEl.selectionEnd);
    if (end === -1) end = v.length;

    const lines = v.slice(start, end).split("\n");
    const allHeading = lines.every(l => !l.trim() || l.startsWith("## "));
    const out = lines.map(l => {
        if (!l.trim()) return l;
        if (allHeading) return l.slice(3);              // dobara dabane pe hata do
        return l.startsWith("## ") ? l : "## " + l;
    }).join("\n");

    textEl.value = v.slice(0, start) + out + v.slice(end);
    textEl.focus();
    textEl.setSelectionRange(start, start + out.length);
    textEl.dispatchEvent(new Event("input"));
});

function prepareText(raw) {
    if (!autoQ.checked) return raw;
    const isQuestion = /^\s*(Q\.?\s*\d+|Question\s*\d+|\d+\s*[.)])\s*\S/i;
    return raw
        .split("\n")
        .map(l => (isQuestion.test(l) && !l.startsWith("## ")) ? "## " + l.trimStart() : l)
        .join("\n");
}

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Generating... (10-30 sec)";
        result.innerHTML = "";

        try {
            const res = await fetch(`${HW_API}/generate`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: prepareText(textEl.value),
                    tone: document.getElementById("hwGenTone").value,
                    style: document.getElementById("hwGenStyle").value,
                    pen_boost: Number(document.getElementById("hwGenPen").value),
                }),
            });

            if (!res.ok) {
                let msg = "Could not generate";
                try { msg = (await res.json()).error || msg; } catch (_) {}
                throw new Error(msg);
            }

            const blob = await res.blob();
            if (lastUrl) URL.revokeObjectURL(lastUrl);
            lastUrl = URL.createObjectURL(blob);

            result.innerHTML = `
                <div class="converter-selected-file">
                    ✅ <strong>Your assignment is ready</strong>
                </div>
                <a class="converter-action-btn" href="${lastUrl}" download="handwriting.pdf">Download PDF</a>
                <a class="converter-action-btn hw-secondary-btn" href="${lastUrl}" target="_blank" rel="noopener">Preview</a>
            `;
        } catch (err) {
            console.error(err);
            showToast(err.message || "Could not generate", "error");
        }

        btn.disabled = textEl.value.trim().length === 0;
        btn.textContent = "Generate PDF";
    });
}