import './_globalHooks.js';
import { describe, it } from 'node:test';

import assert from 'assert';
import getGRPCConfigDNSDiscoveryCluster from './support/getGRPCConfigDNSDiscoveryCluster.js';
import getGRPCConfigGossipCluster from './support/getGRPCConfigGossipCluster.js';
import generateEventId from '../lib/utilities/generateEventId.js';
import KurrentDB from '../lib/index.js';

const eventFactory = new KurrentDB.EventFactory();

describe('gRPC Client - Cluster', () => {
  it(
    'Write and read events using gossip seeds',
    async () => {
      const config = getGRPCConfigGossipCluster();
      const client = new KurrentDB.GRPCClient(config);

      const events = [eventFactory.newEvent('TestEventType', { something: '456' })];
      const testStream = `TestStream-${generateEventId()}`;
      await client.writeEvents(testStream, events);

      const evs = await client.getEvents(testStream);
      assert.equal(evs[0].data.something, '456');

      await client.close();
    },
    { timeout: 5 * 1000 }
  );

  it(
    'Write and read events using DNS discovery',
    async () => {
      const config = getGRPCConfigDNSDiscoveryCluster();
      const client = new KurrentDB.GRPCClient(config);

      const events = [eventFactory.newEvent('TestEventType', { something: '456' })];
      const testStream = `TestStream-${generateEventId()}`;
      await client.writeEvents(testStream, events);

      const evs = await client.getEvents(testStream);
      assert.equal(evs[0].data.something, '456');

      await client.close();
    },
    { timeout: 5 * 1000 }
  );
});
