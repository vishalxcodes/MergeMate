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
const MAX_TEXT = 6000;
const TONES = ["photo", "bright", "white", "cream"];
const STYLES = ["plain", "ruled"];

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

// Load the logged-in user's glyphs (used later by the generator)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const profile = await HandwritingProfile.findOne({ userId: req.userId });
    if (!profile) {
      return res.json({ hasProfile: false, glyphs: [] });
    }
    res.json({ hasProfile: true, glyphs: profile.glyphs });
  } catch (err) {
    console.error("Handwriting load error:", err);
    res.status(500).json({ error: "Could not load handwriting" });
  }
});

// Generate a handwritten PDF using the logged-in user's saved glyphs
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "Please enter some text" });
    if (text.length > MAX_TEXT) {
      return res.status(400).json({ error: `Text too long (max ${MAX_TEXT} characters)` });
    }

    const profile = await HandwritingProfile.findOne({ userId: req.userId });
    if (!profile || !profile.glyphs.length) {
      return res.status(404).json({ error: "Please set up your handwriting first" });
    }

    const glyphs = {};
    for (const g of profile.glyphs) glyphs[g.char] = g.data;

    const pen = Number(body.pen_boost);
    const payload = {
      text,
      glyphs,
      tone: TONES.includes(body.tone) ? body.tone : "photo",
      style: STYLES.includes(body.style) ? body.style : "plain",
      pen_boost: Number.isFinite(pen) ? Math.min(Math.max(pen, 0.8), 1.8) : 1.1,
    };

    const pyRes = await fetch(`${PYTHON_API}/generate-handwriting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });

    if (!pyRes.ok) {
      let msg = "Could not generate";
      try { msg = (await pyRes.json()).error || msg; } catch (_) {}
      return res.status(502).json({ error: msg });
    }

    const pdf = Buffer.from(await pyRes.arrayBuffer());
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="handwriting.pdf"',
    });
    res.send(pdf);
  } catch (err) {
    console.error("Handwriting generate error:", err);
    res.status(500).json({ error: "Could not generate your assignment" });
  }
});

export default router;