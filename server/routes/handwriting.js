import express from "express";
import jwt from "jsonwebtoken";
import HandwritingProfile from "../models/HandwritingProfile.js";

const router = express.Router();

// Must stay in the same order/content as EXPECTED_SEQUENCE in the frontend
const EXPECTED_CHARS = [
  ..."abcdefghijklmnopqrstuvwxyz",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."0123456789",
  ...".,?!'\"-",
];

const MAX_GLYPH_LENGTH = 200000; // base64 chars per glyph, far above a normal crop
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const PYTHON_API = process.env.PDF_SERVICE_URL || "https://mergemate-pdf-to-docx.onrender.com";
const MAX_TEXT = 10000;
const TONES = ["photo", "bright", "white", "cream"];
const STYLES = ["plain", "ruled"];

// ---- look settings a user may change after seeing the page ----------------------------------------------------
// Same keys and ranges as LIMITS in hw_settings.py of the Python service (which clamps once more, so a mistake here
// can never reach the renderer).  A key the user did not send is left out, so the renderer keeps its own default.
const SETTING_LIMITS = {
  slant_deg: [0, 15], //   lean of every letter to the right
  pen_boost: [0.8, 2.0], // pen thickness
  letter_gap: [0, 0.4], //  space between letters (fraction of letter height)
  word_gap: [0.8, 2.0], //  space between words
  size: [0.85, 1.15], //    1 = default letter size
};
const MAX_SEED = 9999;
const NUMBER_RE = /^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?\s*$/;
const PREVIEW_COOLDOWN_MS = 600; // one preview render at a time per user keeps the free Render instance alive
const lastPreviewAt = new Map();

function toNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && NUMBER_RE.test(v)) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function cleanSettings(raw) {
  const out = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [key, [lo, hi]] of Object.entries(SETTING_LIMITS)) {
    if (!(key in raw)) continue;
    const n = toNumber(raw[key]);
    if (n !== null) out[key] = Math.min(hi, Math.max(lo, n));
  }
  return out;
}

function cleanSeed(v) {
  const n = toNumber(v);
  return n === null ? undefined : Math.min(MAX_SEED, Math.max(0, Math.trunc(n)));
}

// JWT_SECRET is read inside the function (dotenv runs after ES-module imports)
function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Please log in first" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Please log in first" });
  }
}

// Save (or overwrite) the logged-in user's glyph set
router.post("/save", requireAuth, async (req, res) => {
  try {
    const incoming = req.body && req.body.glyphs;
    if (!incoming || typeof incoming !== "object") {
      return res.status(400).json({ error: "No glyphs received" });
    }

    const glyphs = [];
    for (const char of EXPECTED_CHARS) {
      const data = incoming[char];
      if (
        typeof data !== "string" ||
        !data ||
        data.length > MAX_GLYPH_LENGTH ||
        !BASE64_RE.test(data)
      ) {
        return res
          .status(400)
          .json({ error: `Missing or invalid glyph for "${char}"` });
      }
      glyphs.push({ char, data });
    }

    await HandwritingProfile.findOneAndUpdate(
      { userId: req.userId },
      { glyphs },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, count: glyphs.length });
  } catch (err) {
    console.error("Handwriting save error:", err);
    res.status(500).json({ error: "Could not save handwriting" });
  }
});

// Load the logged-in user's glyphs (used later by the generator) and their saved look settings
router.get("/me", requireAuth, async (req, res) => {
  try {
    const profile = await HandwritingProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.json({ hasProfile: false, glyphs: [], settings: {} });
    }
    res.json({
      hasProfile: true,
      glyphs: profile.glyphs,
      settings: cleanSettings(profile.settings),
    });
  } catch (err) {
    console.error("Handwriting load error:", err);
    res.status(500).json({ error: "Could not load handwriting" });
  }
});

// Save the user's look settings ("save my style").  An empty object = back to the defaults.
router.put("/settings", requireAuth, async (req, res) => {
  try {
    const settings = cleanSettings(req.body && req.body.settings);
    const profile = await HandwritingProfile.findOneAndUpdate(
      { userId: req.userId },
      { settings },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ error: "Please set up your handwriting first" });
    }
    res.json({ success: true, settings });
  } catch (err) {
    console.error("Handwriting settings error:", err);
    res.status(500).json({ error: "Could not save your style" });
  }
});

// Generate a handwritten PDF using the logged-in user's saved glyphs
//   body.settings : look settings from the sliders (if missing, the user's saved style is used)
//   body.preview  : true = only the first page worth of text, for quick slider feedback
//   body.seed     : changes the small random wobble of the page ("shuffle")
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "Please enter some text" });
    if (text.length > MAX_TEXT) {
      return res.status(400).json({ error: `Text too long (max ${MAX_TEXT} characters)` });
    }

    const preview = body.preview === true;
    if (preview) {
      const now = Date.now();
      if (now - (lastPreviewAt.get(req.userId) || 0) < PREVIEW_COOLDOWN_MS) {
        return res.status(429).json({ error: "Please wait a moment" });
      }
      lastPreviewAt.set(req.userId, now);
      if (lastPreviewAt.size > 5000) lastPreviewAt.clear();
    }

    const profile = await HandwritingProfile.findOne({ userId: req.userId });
    if (!profile || !profile.glyphs.length) {
      return res.status(404).json({ error: "Please set up your handwriting first" });
    }

    const glyphs = {};
    for (const g of profile.glyphs) glyphs[g.char] = g.data;

    const settings =
      body.settings !== undefined
        ? cleanSettings(body.settings)
        : cleanSettings(profile.settings);
    // older frontend sends a plain pen_boost
    const pen = toNumber(body.pen_boost);
    if (settings.pen_boost === undefined && pen !== null) {
      settings.pen_boost = Math.min(2.0, Math.max(0.8, pen));
    }

    const payload = {
      text,
      glyphs,
      tone: TONES.includes(body.tone) ? body.tone : "photo",
      style: STYLES.includes(body.style) ? body.style : "plain",
      settings,
      preview,
    };
    const seed = cleanSeed(body.seed);
    if (seed !== undefined) payload.seed = seed;

    const pyRes = await fetch(`${PYTHON_API}/generate-handwriting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });

    if (!pyRes.ok) {
      let msg = pyRes.status >= 502
        ? "The server is busy or your text is too long. Please try again with fewer pages."
        : "Could not generate";
      try { msg = (await pyRes.json()).error || msg; } catch (_) {}
      return res.status(502).json({ error: msg });
    }

    // normal request -> the PDF; preview -> a small JPEG of the first page (Python decides, we pass it on)
    const out = Buffer.from(await pyRes.arrayBuffer());
    const type = pyRes.headers.get("content-type") || "application/pdf";
    res.set({
      "Content-Type": type,
      "Content-Disposition": type.startsWith("image/")
        ? 'inline; filename="preview.jpg"'
        : 'attachment; filename="handwriting.pdf"',
    });
    res.send(out);
  } catch (err) {
    console.error("Handwriting generate error:", err);
    res.status(500).json({ error: "Could not generate your assignment" });
  }
});

export default router;