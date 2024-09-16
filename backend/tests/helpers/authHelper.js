// tests/helpers/authHelper.js
const jwt = require('jsonwebtoken');

const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateTestToken };
