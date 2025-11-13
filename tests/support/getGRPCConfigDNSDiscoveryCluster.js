import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default () => ({
  protocol: 'kurrentdb+discover',
  hostname: process.env.ES_HOST || 'localhost',
  port: 22137,
  useSslConnection: global.runningTestsInSecureMode,
  tlsCAFile: global.runningTestsInSecureMode ? path.resolve(__dirname, './cluster/certs/ca/ca.crt') : undefined,
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
