import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// POST - naya feedback submit karne ke liye
router.post('/', async (req, res) => {
  try {
    const { type, message, email } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type aur message required hain' });
    }

    const feedback = new Feedback({ type, message, email });
    await feedback.save();

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('Feedback save error:', err);
    res.status(500).json({ error: 'Feedback save nahi ho paya' });
  }
});

export default router;