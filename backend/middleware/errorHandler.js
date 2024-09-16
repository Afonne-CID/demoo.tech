// middleware/errorHandler.js
const currEnv = process.env.NODE_ENV;
const isDevelopment = currEnv === 'development' || currEnv == 'test';

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map(e => e.message) });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: isDevelopment ? err.message : 'Database error occurred' });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(500).json({
    error: isDevelopment ? err.message : 'An unexpected error occurred'
  });
};

module.exports = errorHandler;
