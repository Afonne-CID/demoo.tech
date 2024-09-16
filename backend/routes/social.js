// routes/social.js
const express = require('express');
const { SocialShare, TryOn } = require('../models');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

const createShareValidator = [
  body('tryOnId').isInt().withMessage('Invalid try-on ID'),
  body('platform').isIn(['facebook', 'twitter', 'instagram']).withMessage('Invalid platform'),
  body('shareUrl').isURL().withMessage('Invalid share URL')
];

router.post('/share', authMiddleware, validate(createShareValidator), async (req, res, next) => {
  try {
    const { tryOnId, platform, shareUrl } = req.body;
    
    const tryOn = await TryOn.findByPk(tryOnId);
    if (!tryOn) {
      return res.status(404).json({ error: 'Try-on not found' });
    }

    if (tryOn.UserId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to share this try-on' });
    }

    const share = await SocialShare.create({
      UserId: req.userId,
      TryOnId: tryOnId,
      platform,
      share_url: shareUrl
    });

    res.status(201).json(share);
  } catch (error) {
    next(error);
  }
});

router.get('/shares', authMiddleware, async (req, res, next) => {
  try {
    const shares = await SocialShare.findAll({
      where: { UserId: req.userId },
      include: [TryOn]
    });
    res.json(shares);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
