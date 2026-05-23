const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ProfessionalProfile = require('../models/ProfessionalProfile');
const { protect } = require('../middleware/auth');

// GET /api/directory — browse professionals
router.get('/', async (req, res) => {
  try {
    const { role, specialty, minRating, maxRate, availability, language, page = 1, limit = 20 } = req.query;

    const profileFilter = { verificationStatus: 'approved' };
    if (specialty) profileFilter.specialty = { $in: specialty.split(',') };
    if (minRating) profileFilter.avgRating = { $gte: Number(minRating) };
    if (maxRate) profileFilter.hourlyRate = { $lte: Number(maxRate) };
    if (availability) profileFilter.availabilityStatus = availability;
    if (language) profileFilter.languages = { $in: language.split(',') };

    const profiles = await ProfessionalProfile.find(profileFilter)
      .populate({ path: 'user', select: 'name avatar role isVerified createdAt', match: role ? { role } : {} })
      .sort({ avgRating: -1, totalEngagements: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const filtered = profiles.filter((p) => p.user !== null);
    res.json({ professionals: filtered, total: filtered.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
