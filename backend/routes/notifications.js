// routes/notifications.js
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */

const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getUnreadNotifications, markNotificationAsRead } = require('../services/notificationService');
const { getPagination, getPagingData, getOrder } = require('../helpers/pagination');
const cache = require('../middleware/cache');

const router = express.Router();

router.get('/', authMiddleware(), cache(60), async (req, res, next) => {
  const { page, size, sortBy, sortOrder } = req.query;
  
  try {
    const { limit, offset } = getPagination(page, size);
    const order = getOrder(sortBy, sortOrder);

    const data = await Notification.findAndCountAll({
      where: { UserId: req.userId },
      order,
      limit,
      offset
    });
    
    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const success = await markNotificationAsRead(req.params.id, req.userId);
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
