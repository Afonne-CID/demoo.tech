// models/ProductTag.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');
const Tag = require('./Tag');

const ProductTag = sequelize.define('ProductTag', {});

Product.belongsToMany(Tag, { through: ProductTag });
Tag.belongsToMany(Product, { through: ProductTag });

module.exports = ProductTag;
