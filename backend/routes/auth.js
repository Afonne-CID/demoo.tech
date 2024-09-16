// routes/auth.js
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - user_type
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               user_type:
 *                 type: string
 *                 enum: [individual, business, affiliate]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const { signupValidator, loginValidator } = require('../validators/userValidators');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/signup', validate(signupValidator), async (req, res, next) => {
  try {
    const { email, password, user_type } = req.body;
    const user = await User.create({ email, password_hash: password, user_type, is_sso_user: false });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginValidator), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.is_sso_user && !user.password_hash) {
      return res.status(401).json({ error: 'This account uses SSO. Please log in with the appropriate provider.' });
    }
    if (!await user.validPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// SSO routes
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    handleSSOCallback
  );
}

if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get('/twitter', passport.authenticate('twitter'));
  router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }),
    handleSSOCallback
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
    handleSSOCallback
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_KEY_ID) {
  router.get('/apple', passport.authenticate('apple'));
  router.get('/apple/callback', passport.authenticate('apple', { failureRedirect: '/login' }),
    handleSSOCallback
  );
}

async function handleSSOCallback(req, res) {
  console.log(req, res);
  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}

module.exports = router;
