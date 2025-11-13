import './_globalHooks.js';
import { describe, it } from 'node:test';

import assert from 'assert';
import generateEventId from '../lib/utilities/generateEventId.js';
import getGRPCConfig from './support/getGRPCConfig.js';
import KurrentDB from '../lib/index.js';

const eventFactory = new KurrentDB.EventFactory();

describe('gRPC Client - Stress Tests', () => {
  it(
    'Should handle parallel writes',
    async () => {
      const client = new KurrentDB.GRPCClient(getGRPCConfig());

      const testStream = `TestStream-${generateEventId()}`;
      const numberOfEvents = 5000;
      const events = [];

      for (let i = 1; i <= numberOfEvents; i++) {
        events.push(
          eventFactory.newEvent('TestEventType', {
            something: i
          })
        );
      }

      await Promise.all(events.map((ev) => client.writeEvent(testStream, ev.eventType, ev.data)));
      const evs = await client.getEvents(testStream, undefined, 5000);
      assert.equal(evs.length, 4096);

      await client.close();
    },
    { timeout: 20 * 1000 }
  );

  it(
    'Should handle parallel reads and writes',
    (callback) => {
      const client = new KurrentDB.GRPCClient(getGRPCConfig());

      const testStream = `TestStream-${generateEventId()}`;
      const numberOfEvents = 5000;
      const events = [];
      let writeCount = 0;
      let readCount = 0;

      for (let i = 1; i <= numberOfEvents; i++) {
        events.push(
          eventFactory.newEvent('TestEventType', {
            something: i
          })
        );
      }

      const checkCounts = async () => {
        if (readCount === numberOfEvents && writeCount === numberOfEvents && writeCount === readCount) {
          await client.close();
          callback();
        }
      };

      events.forEach((ev) => {
        client.writeEvent(testStream, ev.eventType, ev.data).then(() => {
          writeCount += 1;
          checkCounts();
        });
      });
      events.forEach(() => {
        client.getEvents(testStream, undefined, 10).then(() => {
          readCount += 1;
          checkCounts();
        });
      });
    },
    { timeout: 60 * 1000 }
  );
});
