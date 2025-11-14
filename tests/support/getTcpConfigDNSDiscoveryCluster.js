import { runningTestsInSecureMode } from '../_globalHooks.js';

export default () => ({
  protocol: 'discover',
  hostname: process.env.ES_HOST || 'localhost',
  port: 22137,
  useSslConnection: runningTestsInSecureMode,
  validateServer: !runningTestsInSecureMode,
  credentials: {
    username: 'admin',
    password: 'changeit'
  },
  poolOptions: {
    autostart: false,
    max: 10,
    min: 0
  }
});
