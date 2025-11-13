import './_globalHooks.js';

import getHttpConfig from './support/getHttpConfig.js';
import EventStore from '../lib/index.js';

describe('Http Client - Send Scavenge Command', () => {
  it('Should send scavenge command', () => {
    const client = new EventStore.HTTPClient(getHttpConfig());
    return client.admin.scavenge();
  });
});
