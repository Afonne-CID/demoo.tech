// services/recommendationService.js
const { User, Product, UserBehavior, Tag } = require('../models');
const { Op } = require('sequelize');

class RecommendationService {
  async trackUserBehavior(userId, productId, action) {
    const [behavior, created] = await UserBehavior.findOrCreate({
      where: { UserId: userId, ProductId: productId, action },
      defaults: { count: 1 }
    });

    if (!created) {
      behavior.count += 1;
      await behavior.save();
    }
  }

  async getCollaborativeRecommendations(userId, limit = 5) {
    // Find users with similar behavior
    const userBehavior = await UserBehavior.findAll({ where: { UserId: userId } });
    const productIds = userBehavior.map(b => b.ProductId);

    const similarUsers = await UserBehavior.findAll({
      where: {
        ProductId: { [Op.in]: productIds },
        UserId: { [Op.ne]: userId }
      },
      group: ['UserId'],
      having: sequelize.literal('COUNT(DISTINCT "ProductId") > 1')
    });

    const similarUserIds = similarUsers.map(u => u.UserId);

    // Find products that similar users interacted with
    const recommendedProducts = await UserBehavior.findAll({
      where: {
        UserId: { [Op.in]: similarUserIds },
        ProductId: { [Op.notIn]: productIds }
      },
      include: [Product],
      group: ['ProductId'],
      order: [[sequelize.fn('COUNT', sequelize.col('ProductId')), 'DESC']],
      limit
    });

    return recommendedProducts.map(r => r.Product);
  }

  async getContentBasedRecommendations(userId, limit = 5) {
    // Get user's viewed and purchased products
    const userBehavior = await UserBehavior.findAll({
      where: { UserId: userId },
      include: [{ model: Product, include: [Tag] }]
    });

    // Count tag occurrences
    const tagCounts = {};
    userBehavior.forEach(behavior => {
      behavior.Product.Tags.forEach(tag => {
        tagCounts[tag.id] = (tagCounts[tag.id] || 0) + 1;
      });
    });

    // Sort tags by count
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tagId]) => parseInt(tagId));

    // Find products with these tags
    const recommendedProducts = await Product.findAll({
      include: [
        {
          model: Tag,
          where: { id: { [Op.in]: sortedTags } }
        }
      ],
      where: {
        id: { [Op.notIn]: userBehavior.map(b => b.ProductId) }
      },
      limit
    });

    return recommendedProducts;
  }

  async getRecommendations(userId, limit = 10) {
    const collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit / 2);
    const contentBasedRecs = await this.getContentBasedRecommendations(userId, limit / 2);

    // Combine and deduplicate recommendations
    const allRecs = [...collaborativeRecs, ...contentBasedRecs];
    const uniqueRecs = Array.from(new Set(allRecs.map(p => p.id)))
      .map(id => allRecs.find(p => p.id === id))
      .slice(0, limit);

    return uniqueRecs;
  }
}

module.exports = new RecommendationService();
