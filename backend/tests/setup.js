// setup.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');


const testSetup = async () => {
  const testUser = await User.create({
    email: 'testuser@cid.com',
    password_hash: 'password123',
    user_type: 'business',
    role: 'business',
    permissions: ['create_product']
  });

  const token = jwt.sign({ 
    userId: testUser.id, 
    role: testUser.role, 
    permissions: testUser.permissions 
  }, process.env.JWT_SECRET);

  return { testUser, testToken: token };
};

jest.setTimeout(10000); // 10 seconds

module.exports = testSetup;
