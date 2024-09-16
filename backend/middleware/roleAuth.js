// middleware/roleAuth.js
const roleAuth = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    };
  };
  
  module.exports = roleAuth;
  