// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid token format' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.userId);


      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (requiredRoles.length && !requiredRoles.includes(user.user_type)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = user;
      req.userId = user.id;
      req.userType = user.user_type;

      // Add role-based access control
      if (requiredRoles.length && !requiredRoles.includes(user.user_type)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Add request timestamp for further rate limiting if needed
      req.requestTime = Date.now();
    
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      next(error);
    }
  };
};

module.exports = authMiddleware;
