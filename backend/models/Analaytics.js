// models/Analytics.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Analytics = sequelize.define('Analytics', {
  event_type: {
    type: DataTypes.ENUM('view', 'try_on', 'share', 'purchase'),
    allowNull: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

Analytics.belongsTo(User);
Analytics.belongsTo(Product);
User.hasMany(Analytics);
Product.hasMany(Analytics);

module.exports = Analytics;
