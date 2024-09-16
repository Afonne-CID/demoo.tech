// routes/tryons.js
/**
 * @swagger
 * /api/tryons:
 *   post:
 *     summary: Create a new try-on
 *     tags: [Try-ons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Try-on created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

const express = require('express');
const { User, TryOn, Product } = require('../models');
const authMiddleware = require('../middleware/auth');
const { createTryOnValidator } = require('../validators/tryOnValidators');
const validate = require('../middleware/validate');
const uploadFile = require('../middleware/fileUpload');
const { recordEvent } = require('../services/analyticsService');
const { getPagination, getPagingData } = require('../helpers/pagination');
const cache = require('../middleware/cache');


const router = express.Router();

// Create a new try-on
router.post('/', authMiddleware(), uploadFile, validate(createTryOnValidator), async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const image_url = req.file.location; // S3 URL of the uploaded file

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const tryOn = await TryOn.create({
      image_url,
      UserId: req.userId,
      ProductId: product_id
    });

    // Record analytics event
    await recordEvent(req.userId, tryOn.ProductId, 'try_on', { tryOnId: tryOn.id });
  
    res.status(201).json(tryOn);
  } catch (error) {
    next(error);
  }
});

  // Get all try-ons for a user (paginated)
  router.get('/user', authMiddleware(), cache(300), async (req, res, next) => {
    const { page, size } = req.query;
    
    try {
      const { limit, offset } = getPagination(page, size);
      const data = await TryOn.findAndCountAll({
        where: { UserId: req.userId },
        include: [
          { model: Product, attributes: ['id', 'name', 'category'] },
          { model: User, attributes: ['id', 'email'] }
        ],
        limit,
        offset
      });
      
      const response = getPagingData(data, page, limit);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

// Get a specific try-on
router.get('/:id', async (req, res) => {
  try {
    const tryOn = await TryOn.findByPk(req.params.id, {
      include: [Product]
    });
    if (!tryOn) {
      return res.status(404).json({ error: 'Try-on not found' });
    }
    res.json(tryOn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a try-on
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const tryOn = await TryOn.findByPk(req.params.id);
    if (!tryOn) {
      return res.status(404).json({ error: 'Try-on not found' });
    }
    if (tryOn.UserId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await tryOn.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
