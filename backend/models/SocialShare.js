// models/SocialShare.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const TryOn = require('./TryOn');

const SocialShare = sequelize.define('SocialShare', {
  platform: {
    type: DataTypes.STRING,
    allowNull: false
  },
  share_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

SocialShare.belongsTo(User);
SocialShare.belongsTo(TryOn);
User.hasMany(SocialShare);
TryOn.hasMany(SocialShare);

module.exports = SocialShare;
