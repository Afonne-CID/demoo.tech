// middleware/permissionAuth.js
const permissionAuth = (requiredPermission) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
        next();
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    };
  };

module.exports = permissionAuth;
