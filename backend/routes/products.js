// routes/products.js
const express = require('express');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const { createProductValidator } = require('../validators/productValidators');
const validate = require('../middleware/validate');
const { createNotification } = require('../services/notificationService');
const uploadFile = require('../middleware/fileUpload');
const { getPagination, getPagingData, getOrder } = require('../helpers/pagination');
const { getAsync, setAsync } = require('../config/redis');
const { Product, Tag, User } = require('../models');
const roleAuth = require('../middleware/roleAuth');
const permissionAuth = require('../middleware/permissionAuth');
const recommendationService = require('../services/recommendationService');

const router = express.Router();

// Create a new product
router.post('/',
  authMiddleware(['business', 'affiliate']),
  roleAuth(['business', 'admin']),
  uploadFile, validate(createProductValidator),
  async (req, res, next) => {

  try {
    const { name, description, category, price } = req.body;

    let image_url;

    // Check if a file was uploaded
    if (req.file && req.file.location) {
      image_url = req.file.location;
    } else if (req.body.image_url) {
      // If no file was uploaded, use the image_url from the request body
      image_url = req.body.image_url;
    } else {
      // If neither a file nor an image_url was provided, return an error
      return res.status(400).json({ error: 'An image file or image URL is required' });
    }

    const product = await Product.create({
      name,
      description,
      category,
      image_url,
      price,
      UserId: req.userId
    });

    // const users = await User.findAll();
    // for (const user of users) {
    //   await createNotification(user.id, `New product added: ${product.name}`, 'new_product');
    // }
  
    // Emit real-time product update
    const io = req.app.get('io');
    io.emit('newProduct', product);

    res.status(201).json(product);

  } catch (error) {
    next(error);
  }
});

// Add tags to a product
router.post('/:id/tags', authMiddleware(['business', 'affiliate']), roleAuth(['business', 'admin']), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const tags = await Promise.all(
      req.body.tags.map(name => Tag.findOrCreate({ where: { name } }))
    );
    await product.setTags(tags.map(tag => tag[0]));
    const updatedTags = await product.getTags();
    res.json({ items: updatedTags });
  } catch (error) {
    next(error);
  }
});

// Get all products (paginated, sorted, and cached)
router.get('/', async (req, res, next) => {
  const { page, size, sortBy, sortOrder, filters } = req.query;

  try {
    const cacheKey = `products:${page}:${size}:${sortBy}:${sortOrder}:${filters}`;
    const cachedResult = await getAsync(cacheKey);

    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    const { limit, offset } = getPagination(page, size);
    const order = getOrder(sortBy, sortOrder);
    const where = filters ? JSON.parse(filters) : {};
    // const where = JSON.parse(filters || '{}');

    // Handle price range filtering
    if (where.price && where.price.start && where.price.end) {
      where.price = {
        [Op.between]: [where.price.start, where.price.end]
      };
    }

    const data = await Product.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: Tag, through: { attributes: [] } }]
    });
    
    const response = getPagingData(data, page, limit);
    
    // Cache the result for 5 minutes
    await setAsync(cacheKey, JSON.stringify(response), 'EX', 300);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get products by tag
router.get('/bytag/:tagName', async (req, res, next) => {
  try {
    const tag = await Tag.findOne({ where: { name: req.params.tagName } });
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    const products = await tag.getProducts();
  
    // Track view behavior if user is authenticated
    if (req.userId) {
      for (const product of products) {
        await recommendationService.trackUserBehavior(req.userId, product.id, 'view');
      }
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Track view behavior if user is authenticated
    if (req.userId) {
      await recommendationService.trackUserBehavior(req.userId, product.id, 'view');
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a product
router.put('/:id', authMiddleware, permissionAuth('edit_product'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.UserId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.UserId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await product.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
