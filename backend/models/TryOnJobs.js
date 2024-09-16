// models/TryOnJob.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const TryOnJob = sequelize.define('TryOnJob', {
  job_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  result_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

TryOnJob.belongsTo(User);
TryOnJob.belongsTo(Product);
User.hasMany(TryOnJob);
Product.hasMany(TryOnJob);

module.exports = TryOnJob;
