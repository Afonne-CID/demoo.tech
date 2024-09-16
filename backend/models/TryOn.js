
// models/TryOn.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const TryOn = sequelize.define('TryOn', {
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

TryOn.belongsTo(User);
TryOn.belongsTo(Product);
User.hasMany(TryOn);
Product.hasMany(TryOn);

module.exports = TryOn;
