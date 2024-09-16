
// models/BusinessProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const BusinessProfile = sequelize.define('BusinessProfile', {
  business_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subscription_plan: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    allowNull: false,
    defaultValue: 'basic'
  }
});

BusinessProfile.belongsTo(User);
User.hasOne(BusinessProfile);

module.exports = BusinessProfile;
