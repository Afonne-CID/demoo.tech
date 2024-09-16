
// models/index.js
const sequelize = require('../config/database');
const User = require('./User');
const UserProfile = require('./UserProfile');
const BusinessProfile = require('./BusinessProfile');
const Product = require('./Product');
const TryOn = require('./TryOn');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Define associations
Product.belongsToMany(Tag, { through: ProductTag });
Tag.belongsToMany(Product, { through: ProductTag });

module.exports = {
  sequelize,
  User,
  UserProfile,
  BusinessProfile,
  Product,
  TryOn,
  Tag,
  ProductTag
};

// // models/index.js
// const sequelize = require('../config/database');
// const User = require('./User');
// const Product = require('./Product');

// // Define associations
// Product.belongsToMany(Tag, { through: 'ProductTags' });
// Tag.belongsToMany(Product, { through: 'ProductTags' });

// module.exports = {
//   sequelize,
//   User,
//   Product,
//   Tag
// };