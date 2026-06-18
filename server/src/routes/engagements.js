const express = require('express');
const router = express.Router();
const Engagement = require('../models/Engagement');
const WorkoutPlan = require('../models/WorkoutPlan');
const MealPlan = require('../models/MealPlan');
const WorkoutLog = require('../models/WorkoutLog');
const MealLog = require('../models/MealLog');
const CheckIn = require('../models/CheckIn');
const ProgressEntry = require('../models/ProgressEntry');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/engagements — list engagements for current user
router.get('/', protect, async (req, res) => {
  try {
    const roleFilter =
      req.user.role === 'client'
        ? { client: req.user._id }
        : req.user.role === 'trainer'
        ? { trainer: req.user._id }
        : req.user.role === 'nutritionist'
        ? { nutritionist: req.user._id }
        : {};

    const engagements = await Engagement.find(roleFilter)
      .populate('client', 'name avatar')
      .populate('trainer', 'name avatar')
      .populate('nutritionist', 'name avatar')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json({ engagements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engagements/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const engagement = await Engagement.findById(req.params.id)
      .populate('client', 'name avatar email')
      .populate('trainer', 'name avatar email role')
      .populate('nutritionist', 'name avatar email role')
      .populate('post', 'title description tags');

    if (!engagement) return res.status(404).json({ error: 'Engagement not found' });

    const isParticipant =
      [engagement.client?._id, engagement.trainer?._id, engagement.nutritionist?._id]
        .filter(Boolean)
        .some((id) => id.toString() === req.user._id.toString()) || req.user.role === 'admin';

    if (!isParticipant) return res.status(403).json({ error: 'Not authorized' });

    // Attach summary data
    const [workoutPlans, mealPlans, recentProgress, pendingCheckIn, unreadMessagesCount] = await Promise.all([
      WorkoutPlan.find({ engagement: engagement._id }).sort({ weekNumber: -1 }).limit(1),
      MealPlan.find({ engagement: engagement._id }).sort({ weekNumber: -1 }).limit(1),
      ProgressEntry.find({ engagement: engagement._id }).sort({ loggedAt: -1 }).limit(1),
      CheckIn.findOne({ engagement: engagement._id, status: 'pending', client: engagement.client._id }),
      Message.countDocuments({ engagement: engagement._id, readBy: { $ne: req.user._id } }),
    ]);

    res.json({ engagement, latestWorkoutPlan: workoutPlans[0] || null, latestMealPlan: mealPlans[0] || null, recentProgress: recentProgress[0] || null, pendingCheckIn, unreadMessagesCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/engagements/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const engagement = await Engagement.findById(req.params.id);
    if (!engagement) return res.status(404).json({ error: 'Engagement not found' });

    const isParticipant = [engagement.client, engagement.trainer, engagement.nutritionist]
      .filter(Boolean)
      .some((id) => id.toString() === req.user._id.toString());
    if (!isParticipant && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });

    engagement.status = req.body.status;
    await engagement.save();
    res.json({ engagement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
