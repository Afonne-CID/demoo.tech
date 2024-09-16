// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const tryOnRoutes = require('./routes/tryons');
const errorHandler = require('./middleware/errorHandler');
const socialRoutes = require('./routes/social');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const virtualTryOnRoutes = require('./routes/virtualTryOn');
const swaggerSpecs = require('./config/swagger');
const adminRoutes = require('./routes/admin');
const recommendationRoutes = require('./routes/recommendations');
const { connectRedis, closeRedis } = require('./config/redis');
require('./config/passport')(passport);


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

// Add this block to configure express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure multer for handling multipart/form-data
const upload = multer({ dest: 'uploads/' });

// Use multer middleware globally or in specific routes
app.use(upload.single('image'));

// Add this near the top of your middleware stack
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all requests
app.use(limiter);

// Apply stricter rate limits to /api/auth/* endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5 // start blocking after 5 requests
});
app.use('/api/auth/', authLimiter);

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/try-on', virtualTryOnRoutes);
app.use('/api/try-ons', tryOnRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api/recommendations', recommendationRoutes);

// Add this after all your route definitions
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: '/api' + middleware.regexp.source.slice(1, -2) + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// Add this after all other routes
app.use('*', (req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Route not found');
});

// Error handling middleware
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to our routes
app.set('io', io);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  Promise.all([
    sequelize.sync({ force: false }),
    connectRedis()
  ]).then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((error) => {
    console.error('Failed to start the server:', error);
    process.exit(1);
  });
}

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'live') {
  const clearModuleCache = require('./utils/clearModuleCache');
  clearModuleCache();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    sequelize.close().then(() => {
      console.log('Database connection closed');
      closeRedis().then(() => {
        console.log('Redis connection closed');
        process.exit(0);
      });
    });
  });
});

module.exports = app;
