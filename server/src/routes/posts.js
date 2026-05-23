const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Bid = require('../models/Bid');
const { protect, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/posts — browse open posts (professionals)
router.get('/', protect, async (req, res) => {
  try {
    const { tags, budgetMin, budgetMax, needsTrainer, needsNutritionist, page = 1, limit = 20 } = req.query;
    const filter = { status: { $in: ['open', 'in_progress'] }, visibility: 'public' };
    if (tags) filter.tags = { $in: tags.split(',') };
    if (budgetMin) filter.budgetMax = { $gte: Number(budgetMin) };
    if (budgetMax) filter.budgetMin = { $lte: Number(budgetMax) };
    if (needsTrainer === 'true') filter.needsTrainer = true;
    if (needsNutritionist === 'true') filter.needsNutritionist = true;

    const posts = await Post.find(filter)
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/my — client's own posts
router.get('/my', protect, authorize('client'), async (req, res) => {
  try {
    const posts = await Post.find({ client: req.user._id }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('client', 'name avatar createdAt');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts — create post (client only)
router.post(
  '/',
  protect,
  authorize('client'),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty(),
    body('budgetMin').isNumeric(),
    body('budgetMax').isNumeric(),
    body('durationWeeks').isNumeric(),
    body('trainingLocation').optional().isIn(['home', 'gym', 'any']),
    body('equipmentAvailable').optional().isString(),
  ],
  validate,
  async (req, res) => {
    try {
      const post = await Post.create({ ...req.body, client: req.user._id });
      res.status(201).json({ post });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/posts/:id — update post (owner only)
router.put('/:id', protect, authorize('client'), async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, client: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.status !== 'open') return res.status(400).json({ error: 'Cannot edit a non-open post' });
    Object.assign(post, req.body);
    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, authorize('client'), async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, client: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/:id/bids — get bids on a post
router.get('/:id/bids', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Only client owner or admin can see all bids
    const isOwner = post.client.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized' });

    const bids = await Bid.find({ post: req.params.id })
      .populate('professional', 'name avatar role isVerified')
      .sort({ createdAt: -1 });
    res.json({ bids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
