import { fileURLToPath } from 'node:url';
import path from 'path';
import { runningTestsInSecureMode } from '../_globalHooks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default () => ({
  useSslConnection: runningTestsInSecureMode,
  tlsCAFile: runningTestsInSecureMode ? path.resolve(__dirname, './cluster/certs/ca/ca.crt') : undefined,
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
