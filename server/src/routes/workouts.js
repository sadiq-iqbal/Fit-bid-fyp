const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutLog = require('../models/WorkoutLog');
const Engagement = require('../models/Engagement');
const { protect, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');

const isEngagementParticipant = async (engagementId, userId) => {
  const eng = await Engagement.findById(engagementId);
  if (!eng) return null;
  const ids = [eng.client, eng.trainer, eng.nutritionist].filter(Boolean).map(String);
  return ids.includes(String(userId)) ? eng : null;
};

// GET /api/workouts/engagement/:engagementId
router.get('/engagement/:engagementId', protect, async (req, res) => {
  try {
    const eng = await isEngagementParticipant(req.params.engagementId, req.user._id);
    if (!eng) return res.status(403).json({ error: 'Not authorized' });
    const plans = await WorkoutPlan.find({ engagement: req.params.engagementId }).sort({ weekNumber: 1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts — create a workout plan (trainer only)
router.post('/', protect, authorize('trainer'), async (req, res) => {
  try {
    const { engagementId, weekNumber, title, difficultyLevel, days, notes } = req.body;
    const eng = await Engagement.findOne({ _id: engagementId, trainer: req.user._id });
    if (!eng) return res.status(403).json({ error: 'Not authorized' });

    const plan = await WorkoutPlan.create({ engagement: engagementId, trainer: req.user._id, weekNumber, title, difficultyLevel, days, notes });
    await createNotification(eng.client, 'workout_assigned', `Your trainer assigned a new workout plan for week ${weekNumber}`, `/engagements/${engagementId}`);
    res.status(201).json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workouts/:id — update plan
router.put('/:id', protect, authorize('trainer'), async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndUpdate({ _id: req.params.id, trainer: req.user._id }, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/log — client logs a workout
router.post('/log', protect, authorize('client'), async (req, res) => {
  try {
    const { engagementId, workoutPlanId, dayId, notes, rating, skipped } = req.body;
    const eng = await Engagement.findOne({ _id: engagementId, client: req.user._id });
    if (!eng) return res.status(403).json({ error: 'Not authorized' });

    const log = await WorkoutLog.create({ engagement: engagementId, client: req.user._id, workoutPlan: workoutPlanId, dayId, notes, rating, skipped });

    if (eng.trainer) {
      await createNotification(eng.trainer, 'progress_logged', 'Your client logged a workout', `/engagements/${engagementId}`);
    }
    res.status(201).json({ log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/logs/:engagementId
router.get('/logs/:engagementId', protect, async (req, res) => {
  try {
    const eng = await isEngagementParticipant(req.params.engagementId, req.user._id);
    if (!eng) return res.status(403).json({ error: 'Not authorized' });
    const logs = await WorkoutLog.find({ engagement: req.params.engagementId }).sort({ completedAt: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
