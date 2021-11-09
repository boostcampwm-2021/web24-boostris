const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  // app.use(
  //   '/api',
  //   createProxyMiddleware('/api', {
  //     target: 'http://localhost:4000',
  //     changeOrigin: true,
  //   })
  // );
  // const socketProxy = createProxyMiddleware('/socket', {
  //   target: 'http://localhost:5001/socket',
  //   changeOrigin: true,
  //   ws: true,
  //   logLevel: 'debug',
  // });

  // app.use('/socket', socketProxy);
  app.use(
    createProxyMiddleware(['/api', '/socket.io'], {
      target: 'http://localhost:4000',
      changeOrigin: true,
      ws: true,
      router: {
        '/socket.io': 'http://localhost:5001',
      },
    })
  );
};
