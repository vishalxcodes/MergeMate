import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// Simple password check middleware
function checkAdminPassword(req, res, next) {
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// GET - sara feedback fetch karo, sabse naya pehle
router.get('/feedback', checkAdminPassword, async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedback: allFeedback });
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

export default router;