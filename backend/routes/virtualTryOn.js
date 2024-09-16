// routes/virtualTryOn.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const uploadFile = require('../middleware/fileUpload');
const virtualTryOnService = require('../services/virtualTryOnService');

router.post('/', authMiddleware(), uploadFile, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const jobId = await virtualTryOnService.queueTryOnJob(req.userId, req.file.buffer, req.body.productId);

    res.status(202).json({ jobId });
  } catch (error) {
    next(error);
  }
});

router.get('/status/:jobId', authMiddleware(), async (req, res, next) => {
  try {
    const status = await virtualTryOnService.getTryOnStatus(req.params.jobId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
