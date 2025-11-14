export default () => ({
  protocol: runningTestsInSecureMode ? 'https' : 'http',
  hostname: process.env.ES_HOST || 'localhost',
  validateServer: !runningTestsInSecureMode,
  port: 22117,
  credentials: {
    username: 'admin',
    password: 'changeit'
  }
});
