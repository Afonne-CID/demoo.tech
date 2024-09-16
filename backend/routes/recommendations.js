// routes/recommendations.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const recommendationService = require('../services/recommendationService');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const recommendations = await recommendationService.getRecommendations(req.userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
