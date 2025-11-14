import { runningTestsInSecureMode } from '../_globalHooks.js';

export default () => ({
  useSslConnection: runningTestsInSecureMode,
  validateServer: !runningTestsInSecureMode,
  gossipSeeds: [
    { hostname: process.env.ES_HOST || 'localhost', port: 22137 },
    { hostname: process.env.ES_HOST || 'localhost', port: 22157 },
    { hostname: process.env.ES_HOST || 'localhost', port: 22177 }
  ],
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
