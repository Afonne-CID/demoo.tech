// routes/analytics.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getProductAnalytics } = require('../services/analyticsService');
const { param, query } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

const getAnalyticsValidator = [
  param('productId').isInt().withMessage('Invalid product ID'),
  query('startDate').isISO8601().toDate().withMessage('Invalid start date'),
  query('endDate').isISO8601().toDate().withMessage('Invalid end date')
];

router.get('/products/:productId', 
  authMiddleware(['business', 'affiliate']),
  validate(getAnalyticsValidator),
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { startDate, endDate } = req.query;
      
      const analytics = await getProductAnalytics(req.userId, productId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
