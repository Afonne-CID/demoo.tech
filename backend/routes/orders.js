// routes/orders.js
router.post('/', authMiddleware, async (req, res) => {
    try {
      const order = await Order.create(req.body);
  
      // Track purchase behavior
      for (const item of req.body.items) {
        await recommendationService.trackUserBehavior(req.userId, item.productId, 'purchase');
      }
  
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
