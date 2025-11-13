import './_globalHooks.js';
import { describe, it } from 'node:test';

import assert from 'assert';
import getHttpConfig from './support/getHttpConfig.js';
import KurrentDB from '../lib/index.js';

describe('Http Client - Ping', () => {
  it('Should return successful when OK', () => {
    const client = new KurrentDB.HTTPClient(getHttpConfig());
    return client.ping();
  });

  it(
    'Should fail when not OK',
    () => {
      const config = getHttpConfig();
      config.hostname = 'MadeToFailHostName';

      const client = new KurrentDB.HTTPClient(config);

      return client
        .ping()
        .then(() => {
          throw new Error('Should not succeed');
        })
        .catch((err) => {
          assert(err, 'Error expected');
          assert(err.message, 'Error Message Expected');
        });
    },
    { timeout: 30 * 1000 }
  );
});
