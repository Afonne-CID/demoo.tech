// services/notificationService.js
const { Notification, User } = require('../models');

const createNotification = async (userId, content, type) => {
  const notification = await Notification.create({
    UserId: userId,
    content,
    type
  });

  // Emit real-time notification
  const io = require('../server').get('io');
  io.to(userId).emit('notification', notification);

  return notification;
};

const getUnreadNotifications = async (userId) => {
  return await Notification.findAll({
    where: {
      UserId: userId,
      is_read: false
    }
  });
};

const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      UserId: userId
    }
  });

  if (notification) {
    notification.is_read = true;
    await notification.save();
    return true;
  }

  return false;
};

module.exports = {
  createNotification,
  getUnreadNotifications,
  markNotificationAsRead
};
