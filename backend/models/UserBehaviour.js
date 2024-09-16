// models/UserBehavior.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const UserBehavior = sequelize.define('UserBehavior', {
  action: {
    type: DataTypes.ENUM('view', 'purchase'),
    allowNull: false
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
});

UserBehavior.belongsTo(User);
UserBehavior.belongsTo(Product);
User.hasMany(UserBehavior);
Product.hasMany(UserBehavior);

module.exports = UserBehavior;
