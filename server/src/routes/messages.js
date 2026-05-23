const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Engagement = require('../models/Engagement');
const { protect } = require('../middleware/auth');

const isParticipant = async (engagementId, userId) => {
  const eng = await Engagement.findById(engagementId);
  if (!eng) return false;
  return [eng.client, eng.trainer, eng.nutritionist].filter(Boolean).map(String).includes(String(userId));
};

// GET /api/messages/:engagementId
router.get('/:engagementId', protect, async (req, res) => {
  try {
    if (!(await isParticipant(req.params.engagementId, req.user._id))) return res.status(403).json({ error: 'Not authorized' });
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ engagement: req.params.engagementId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
