// utils/routeExtractor.js

function extractRoutes(app) {
    const routes = [];
  
    function extractRouteInfo(stack, baseUrl = '') {
      stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: baseUrl + middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        } else if (middleware.name === 'router') {
          const routerBaseUrl = baseUrl + (middleware.regexp.source.replace(/\^|\/\?(?=\$)|\/(?=\$)/g, ''));
          extractRouteInfo(middleware.handle.stack, routerBaseUrl);
        }
      });
    }
  
    extractRouteInfo(app._router.stack);
    return routes;
  }

module.exports = extractRoutes;
