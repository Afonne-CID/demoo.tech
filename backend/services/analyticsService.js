// services/analyticsService.js
const { Analytics, Product, User } = require('../models');
const { Op } = require('sequelize');

const recordEvent = async (userId, productId, eventType, details = {}) => {
  return await Analytics.create({
    UserId: userId,
    ProductId: productId,
    event_type: eventType,
    details
  });
};

const getProductAnalytics = async (userId, productId, startDate, endDate) => {
  const product = await Product.findOne({
    where: { id: productId, UserId: userId }
  });

  if (!product) {
    throw new Error('Product not found or you do not have permission to view its analytics');
  }

  return await Analytics.findAll({
    where: {
      ProductId: productId,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: [
      'event_type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['event_type']
  });
};

module.exports = {
  recordEvent,
  getProductAnalytics
};
