const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const MealLog = require('../models/MealLog');
const Engagement = require('../models/Engagement');
const { protect, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');

const isParticipant = async (engagementId, userId) => {
  const eng = await Engagement.findById(engagementId);
  if (!eng) return null;
  const ids = [eng.client, eng.trainer, eng.nutritionist].filter(Boolean).map(String);
  return ids.includes(String(userId)) ? eng : null;
};

// GET /api/meals/engagement/:engagementId
router.get('/engagement/:engagementId', protect, async (req, res) => {
  try {
    const eng = await isParticipant(req.params.engagementId, req.user._id);
    if (!eng) return res.status(403).json({ error: 'Not authorized' });
    const plans = await MealPlan.find({ engagement: req.params.engagementId }).sort({ weekNumber: 1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals — create meal plan (nutritionist only)
router.post('/', protect, authorize('nutritionist'), async (req, res) => {
  try {
    const { engagementId, weekNumber, dailyCalories, proteinG, carbsG, fatsG, fiberG, allergyFlags, meals, notes } = req.body;
    const eng = await Engagement.findOne({ _id: engagementId, nutritionist: req.user._id });
    if (!eng) return res.status(403).json({ error: 'Not authorized' });

    const plan = await MealPlan.create({ engagement: engagementId, nutritionist: req.user._id, weekNumber, dailyCalories, proteinG, carbsG, fatsG, fiberG, allergyFlags, meals, notes });
    await createNotification(eng.client, 'meal_plan_assigned', `Your nutritionist assigned a new meal plan for week ${weekNumber}`, `/engagements/${engagementId}`);
    res.status(201).json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/meals/:id
router.put('/:id', protect, authorize('nutritionist'), async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndUpdate({ _id: req.params.id, nutritionist: req.user._id }, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals/log
router.post('/log', protect, authorize('client'), async (req, res) => {
  try {
    const { engagementId, mealPlanId, mealId, compliance, notes } = req.body;
    const eng = await Engagement.findOne({ _id: engagementId, client: req.user._id });
    if (!eng) return res.status(403).json({ error: 'Not authorized' });

    const log = await MealLog.create({ engagement: engagementId, client: req.user._id, mealPlan: mealPlanId, mealId, compliance, notes });
    if (eng.nutritionist) {
      await createNotification(eng.nutritionist, 'progress_logged', 'Your client logged a meal', `/engagements/${engagementId}`);
    }
    res.status(201).json({ log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meals/logs/:engagementId
router.get('/logs/:engagementId', protect, async (req, res) => {
  try {
    const eng = await isParticipant(req.params.engagementId, req.user._id);
    if (!eng) return res.status(403).json({ error: 'Not authorized' });
    const logs = await MealLog.find({ engagement: req.params.engagementId }).sort({ loggedAt: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
