// models/UserProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserProfile = sequelize.define('UserProfile', {
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_picture_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

UserProfile.belongsTo(User);
User.hasOne(UserProfile);

module.exports = UserProfile;
