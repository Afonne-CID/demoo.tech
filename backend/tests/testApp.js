// testApp.js
const express = require('express');
const path = require('path');
const loadRoutes = require('./utils/routeLoader');

const app = express();
app.use(express.json());

// Dynamically load and use all routes
const routesDirectory = path.join(__dirname, 'routes');
const routes = loadRoutes(routesDirectory);

routes.forEach(({ routeName, route }) => {
    app.use(`/api/${routeName}`, route);
});

module.exports = app;
