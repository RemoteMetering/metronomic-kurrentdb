import { runningTestsInSecureMode } from '../_globalHooks.js';

export default () => ({
  hostname: process.env.ES_HOST || 'localhost',
  port: 11116,
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
