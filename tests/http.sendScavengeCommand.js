import './_globalHooks.js';
import { describe, it } from 'node:test';

import getHttpConfig from './support/getHttpConfig.js';
import KurrentDB from '../lib/index.js';

describe('Http Client - Send Scavenge Command', () => {
  it('Should send scavenge command', () => {
    const client = new KurrentDB.HTTPClient(getHttpConfig());
    return client.admin.scavenge();
  });
});
