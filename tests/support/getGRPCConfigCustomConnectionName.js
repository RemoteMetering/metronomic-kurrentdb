import { runningTestsInSecureMode } from '../_globalHooks.js';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default () => ({
  hostname: process.env.ES_HOST || 'localhost',
  port: 22117,
  useSslConnection: runningTestsInSecureMode,
  tlsCAFile: runningTestsInSecureMode ? path.resolve(__dirname, './single/certs/ca/ca.crt') : undefined,
  credentials: {
    username: 'admin',
    password: 'changeit'
  },
  poolOptions: {
    autostart: false,
    max: 10,
    min: 0
  },
  connectionNameGenerator: () => `CUSTOM_GRPC_CONNECTION_NAME_${new Date().getTime()}`
});
