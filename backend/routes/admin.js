// routes/admin.js
const express = require('express');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Only admins can access this route
router.get('/users', authMiddleware, roleAuth(['admin']), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Only admins can update user roles and permissions
router.put('/users/:id/role', authMiddleware, roleAuth(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.role = req.body.role;
    user.permissions = req.body.permissions;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
