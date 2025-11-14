import { describe, it } from 'node:test';

import assert from 'assert';
import generateEventId from '../lib/utilities/generateEventId.js';
import getGRPCConfig from './support/getGRPCConfig.js';
import KurrentDB from '../lib/index.js';

describe('GRPC Client - Check Stream Exist', () => {
  it(
    'Should return true when a stream exists',
    async () => {
      const client = new KurrentDB.GRPCClient(getGRPCConfig());

      const testStream = `TestStream-${generateEventId()}`;
      await client.writeEvent(testStream, 'TestEventType', {
        something: '123'
      });
      assert.equal(await client.checkStreamExists(testStream), true);

      await client.close();
    },
    { timeout: 5000 }
  );

  it(
    'Should return false when a stream does not exist',
    async () => {
      const client = new KurrentDB.GRPCClient(getGRPCConfig());

      assert.equal(await client.checkStreamExists('Non_existentStream'), false);

      await client.close();
    },
    { timeout: 5000 }
  );
});
