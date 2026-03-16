const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      onError(err, req, res) {
        console.error('Proxy error:', err.message);
        res.status(503).json({
          message: 'Backend unavailable. Please ensure the server is running on port 5000.',
        });
      },
    })
  );
};
