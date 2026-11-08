// handwritingStylePanel.js
// "Fine-tune your handwriting": 5 sliders + live preview + reset / shuffle / save my style.
// It builds its own DOM (no HTML change needed) and talks to the same /api/handwriting routes as the generator.

// key = what the server calls it; def = the look the renderer has when nothing is changed
// (letter_gap / word_gap / size defaults must stay equal to DEFAULT_CFG in hw_renderer.py)
const CONTROLS = [
  { key: "slant_deg", label: "Slant", min: 0, max: 15, step: 0.5, def: 0, fmt: (v) => `${v}°` },
  { key: "pen_boost", label: "Pen thickness", min: 0.8, max: 2.0, step: 0.05, def: 1.1, fmt: (v) => v.toFixed(2) },
  { key: "letter_gap", label: "Letter spacing", min: 0, max: 0.4, step: 0.01, def: 0.16, fmt: (v) => v.toFixed(2) },
  { key: "word_gap", label: "Word spacing", min: 0.8, max: 2.0, step: 0.05, def: 1.0, fmt: (v) => v.toFixed(2) },
  { key: "size", label: "Letter size", min: 0.85, max: 1.15, step: 0.01, def: 1.0, fmt: (v) => `${Math.round(v * 100)}%` },
];
const DEFAULT_SEED = 1; // same as the Python default, so preview and download wobble the same way
const PREVIEW_RETRY_MS = 700;

const CSS = `
.hw-style-panel{margin-top:18px;padding:16px;border:1px solid rgba(128,128,128,.35);border-radius:12px;text-align:left}
.hw-style-panel[hidden]{display:none}
.hw-style-title{margin:0 0 4px;font-size:1.05rem}
.hw-style-hint{margin:0 0 12px;opacity:.7;font-size:.9rem}
.hw-style-preview{min-height:60px;margin-bottom:14px;text-align:center}
.hw-style-preview img{max-width:100%;border-radius:8px;border:1px solid rgba(128,128,128,.3)}
.hw-style-status{min-height:1.2em;font-size:.85rem;opacity:.75;margin-top:6px}
.hw-style-row{display:grid;grid-template-columns:130px 1fr 52px;gap:10px;align-items:center;margin:8px 0}
.hw-style-row input[type=range]{width:100%}
.hw-style-val{text-align:right;font-variant-numeric:tabular-nums;opacity:.85}
.hw-style-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
@media (max-width:520px){.hw-style-row{grid-template-columns:1fr 52px}.hw-style-row label{grid-column:1/3}}
`;

export function createStylePanel({
  api, // ".../api/handwriting"
  resultEl, // where the download button lives
  getText, // () => text to write (already prepared)
  getTone, // () => "photo" | ...
  getStyle, // () => "plain" | "ruled"
  penEl = null, // the older pen slider of the page, kept in sync
  toast = () => {},
  previewDelay = 900, // ms to wait after the last slider move
}) {
  if (!document.getElementById("hwStylePanelCss")) {
    const st = document.createElement("style");
    st.id = "hwStylePanelCss";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  const penDefault = penEl && Number.isFinite(Number(penEl.value)) && Number(penEl.value) > 0 ? Number(penEl.value) : 1.1;
  const defaults = Object.fromEntries(CONTROLS.map((c) => [c.key, c.key === "pen_boost" ? penDefault : c.def]));

  // ---- DOM -----------------------------------------------------------------------------------------------------
  const panel = document.createElement("div");
  panel.className = "hw-style-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <h3 class="hw-style-title">Fine-tune your handwriting</h3>
    <p class="hw-style-hint">Move a slider and the preview updates by itself.</p>
    <div class="hw-style-preview"><img alt="Preview of the first page" hidden><div class="hw-style-status"></div></div>
    <div class="hw-style-rows"></div>
    <div class="hw-style-actions">
      <button type="button" class="converter-action-btn hw-secondary-btn" data-act="reset">Reset</button>
      <button type="button" class="converter-action-btn hw-secondary-btn" data-act="shuffle">Shuffle</button>
      <button type="button" class="converter-action-btn hw-secondary-btn" data-act="save">Save my style</button>
    </div>`;
  const imgEl = panel.querySelector("img");
  const statusEl = panel.querySelector(".hw-style-status");
  const rowsEl = panel.querySelector(".hw-style-rows");
  const inputs = {};
  const valueEls = {};
  for (const c of CONTROLS) {
    const row = document.createElement("div");
    row.className = "hw-style-row";
    row.innerHTML = `<label>${c.label}</label>
      <input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${defaults[c.key]}" data-key="${c.key}">
      <span class="hw-style-val"></span>`;
    rowsEl.appendChild(row);
    inputs[c.key] = row.querySelector("input");
    valueEls[c.key] = row.querySelector(".hw-style-val");
  }
  resultEl.insertAdjacentElement("afterend", panel);

  // ---- state ---------------------------------------------------------------------------------------------------
  let seed = DEFAULT_SEED;
  let previewTimer = null;
  let previewCtl = null;
  let previewUrl = null;

  const num = (c) => Number(inputs[c.key].value);
  const refreshLabels = () => CONTROLS.forEach((c) => (valueEls[c.key].textContent = c.fmt(num(c))));
  const getSettings = () => Object.fromEntries(CONTROLS.map((c) => [c.key, num(c)]));
  const getSeed = () => seed;
  const setStatus = (t) => (statusEl.textContent = t || "");
  refreshLabels();

  function setValue(key, v) {
    const c = CONTROLS.find((x) => x.key === key);
    if (!c || typeof v !== "number" || !Number.isFinite(v)) return;
    inputs[key].value = String(Math.min(c.max, Math.max(c.min, v)));
    if (key === "pen_boost" && penEl) penEl.value = inputs[key].value;
  }

  function body(extra) {
    return JSON.stringify({ text: getText(), tone: getTone(), style: getStyle(), settings: getSettings(), seed, ...extra });
  }

  // ---- preview -------------------------------------------------------------------------------------------------
  function schedulePreview() {
    clearTimeout(previewTimer);
    markStale();
    previewTimer = setTimeout(() => runPreview(true), previewDelay);
  }

  async function runPreview(retry) {
    if (!getText().trim()) {
      setStatus("Write some text first to see a preview.");
      return;
    }
    if (previewCtl) previewCtl.abort();
    const ctl = (previewCtl = new AbortController());
    setStatus("Updating preview...");
    try {
      const res = await fetch(`${api}/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body({ preview: true }),
        signal: ctl.signal,
      });
      if (res.status === 429 && retry) {
        await new Promise((r) => setTimeout(r, PREVIEW_RETRY_MS));
        if (ctl.signal.aborted) return;
        return runPreview(false);
      }
      if (!res.ok) {
        let msg = "Could not update the preview";
        try { msg = (await res.json()).error || msg; } catch (_) {}
        throw new Error(msg);
      }
      const blob = await res.blob();
      if (ctl.signal.aborted) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(blob);
      imgEl.src = previewUrl;
      imgEl.hidden = false;
      setStatus("");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      setStatus(err.message || "Could not update the preview");
    }
  }

  // ---- download (the file made before the sliders moved is out of date) ---------------------------------------
  function markStale() {
    if (resultEl.querySelector("[data-hw-stale]")) return;
    resultEl.innerHTML = `
      <div class="converter-selected-file" data-hw-stale>Settings changed - your download will use the new look</div>
      <button type="button" class="converter-action-btn" data-act="download">Download PDF</button>`;
    resultEl.querySelector("[data-act=download]").addEventListener("click", downloadFull);
  }

  async function downloadFull(e) {
    const btn = e.currentTarget;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Preparing... (10-30 sec)";
    try {
      const res = await fetch(`${api}/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body({}),
      });
      if (!res.ok) {
        let msg = "Could not generate";
        try { msg = (await res.json()).error || msg; } catch (_) {}
        throw new Error(msg);
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "handwriting.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast(err.message || "Could not generate", "error");
    }
    btn.disabled = false;
    btn.textContent = label;
  }

  // ---- events --------------------------------------------------------------------------------------------------
  for (const c of CONTROLS) {
    inputs[c.key].addEventListener("input", () => {
      refreshLabels();
      if (c.key === "pen_boost" && penEl) penEl.value = inputs[c.key].value;
      schedulePreview();
    });
  }
  if (penEl) {
    penEl.addEventListener("input", () => {
      setValue("pen_boost", Number(penEl.value));
      refreshLabels();
      schedulePreview();
    });
  }

  panel.addEventListener("click", async (e) => {
    const act = e.target && e.target.getAttribute && e.target.getAttribute("data-act");
    if (act === "reset") {
      for (const c of CONTROLS) setValue(c.key, defaults[c.key]);
      seed = DEFAULT_SEED;
      refreshLabels();
      schedulePreview();
    } else if (act === "shuffle") {
      seed = Math.floor(Math.random() * 10000);
      schedulePreview();
    } else if (act === "save") {
      try {
        const res = await fetch(`${api}/settings`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: getSettings() }),
        });
        if (!res.ok) throw new Error("Could not save your style");
        toast("Your style is saved", "success");
      } catch (err) {
        toast(err.message || "Could not save your style", "error");
      }
    }
  });

  return {
    getSettings,
    getSeed,
    show() { panel.hidden = false; },
    // style saved earlier (GET /me): put the sliders there; unknown / bad values are ignored
    applySaved(settings) {
      if (!settings || typeof settings !== "object") return;
      for (const c of CONTROLS) setValue(c.key, settings[c.key]);
      refreshLabels();
    },
  };
}