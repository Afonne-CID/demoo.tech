// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_type: {
    type: DataTypes.ENUM('individual', 'business', 'affiliate'),
    allowNull: false
  },
  facebook_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  twitter_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  apple_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  is_sso_user: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  sso_provider: {
    type: DataTypes.ENUM('facebook', 'twitter', 'google', 'apple'),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'business', 'affiliate', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (!user.is_sso_user && user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && !user.is_sso_user) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

// User.prototype.validPassword = async function(password) {
//   return await bcrypt.compare(password, this.password_hash);
// };

User.prototype.validPassword = async function(password) {
  return this.password_hash ? await bcrypt.compare(password, this.password_hash) : false;
};

module.exports = User;
