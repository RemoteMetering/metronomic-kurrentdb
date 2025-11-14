import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import assert from 'assert';
import path from 'path';
import fs from 'fs';

import KurrentDB from '../lib/index.js';
import generateEventId from '../lib/utilities/generateEventId.js';
import getHttpConfig from './support/getHttpConfig.js';
import sleep from './utilities/sleep.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Projections', () => {
  describe(
    'Default Settings',
    () => {
      const assertionProjection = generateEventId();
      const assertionProjectionContent = fs.readFileSync(`${__dirname}/support/testProjection.js`, {
        encoding: 'utf8'
      });

      it('Should create continuous projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.assert(assertionProjection, assertionProjectionContent);
        assert.equal(response.name, assertionProjection);

        const responseWithTrackEmittedStreamsEnabled = await client.projections.getInfo(assertionProjection, true);
        assert.equal(responseWithTrackEmittedStreamsEnabled.config.emitEnabled, false);
        assert.equal(responseWithTrackEmittedStreamsEnabled.config.trackEmittedStreams, false);
      });

      it('Should update existing projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.assert(assertionProjection, assertionProjectionContent);
        assert.equal(response.name, assertionProjection);
      });

      it('Should stop projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.stop(assertionProjection);
        assert.equal(response.name, assertionProjection);
        const projectionInfo = await client.projections.getInfo(assertionProjection);
        assert.equal(projectionInfo.status, 'Stopped');
      });

      it('Should start projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.start(assertionProjection);
        assert.equal(response.name, assertionProjection);
        const projectionInfo = await client.projections.getInfo(assertionProjection);
        assert.equal(projectionInfo.status, 'Running');
      });

      it('Should reset projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.reset(assertionProjection);
        assert.equal(response.name, assertionProjection);
        const projectionInfo = await client.projections.getInfo(assertionProjection);
        assert(
          ['Preparing/Stopped', 'Running'].includes(projectionInfo.status),
          `Invalid status after reset: ${projectionInfo.status}`
        );
      });

      it('Should remove continuous projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const stopResponse = await client.projections.stop(assertionProjection);
        await sleep(1000);

        assert.equal(stopResponse.name, assertionProjection);
        const removeResponse = await client.projections.remove(assertionProjection);
        assert.equal(removeResponse.name, assertionProjection);
      });
    },
    { timeout: 40 * 1000 }
  );

  describe(
    'Custom Settings',
    () => {
      const assertionProjection = generateEventId();
      const assertionProjectionContent = fs.readFileSync(`${__dirname}/support/testProjection.js`, {
        encoding: 'utf8'
      });

      it('Should create one-time projection with all settings enabled', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.assert(
          assertionProjection,
          assertionProjectionContent,
          'onetime',
          true,
          true,
          true,
          true
        );
        await sleep(2000);
        assert.equal(response.name, assertionProjection);
        const responseWithTrackEmittedStreamsEnabled = await client.projections.getInfo(assertionProjection, true);
        assert.equal(responseWithTrackEmittedStreamsEnabled.config.trackEmittedStreams, true);
        assert.equal(responseWithTrackEmittedStreamsEnabled.config.emitEnabled, true);
      });

      it('Should get config for continuous projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const projectionConfig = await client.projections.config(assertionProjection);
        await sleep(1000);

        assert.equal(projectionConfig.emitEnabled, true);
        assert.equal(projectionConfig.trackEmittedStreams, true);
        assert.equal(projectionConfig.msgTypeId, 300);
        assert.equal(projectionConfig.checkpointHandledThreshold, 4000);
        assert.equal(projectionConfig.checkpointUnhandledBytesThreshold, 10000000);
        assert.equal(projectionConfig.pendingEventsThreshold, 5000);
        assert.equal(projectionConfig.maxWriteBatchLength, 500);
      });

      it('Should remove one-time projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const stopResponse = await client.projections.stop(assertionProjection);
        assert.equal(stopResponse.name, assertionProjection);
        const removeResponse = await client.projections.remove(assertionProjection);
        assert.equal(removeResponse.name, assertionProjection);
      });

      it('Should create one-time projection with emits enabled but trackEmittedStreams disabled then remove it', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const response = await client.projections.assert(
          assertionProjection,
          assertionProjectionContent,
          'onetime',
          true,
          true,
          true
        );
        await sleep(2000);
        assert.equal(response.name, assertionProjection);
        const responseWithTrackEmittedStreamsEnabled = await client.projections.getInfo(assertionProjection, true);
        assert.equal(responseWithTrackEmittedStreamsEnabled.config.trackEmittedStreams, false);
        assert.equal(responseWithTrackEmittedStreamsEnabled.config.emitEnabled, true);

        const stopResponse = await client.projections.stop(assertionProjection);
        assert.equal(stopResponse.name, assertionProjection);
        const removeResponse = await client.projections.remove(assertionProjection);
        assert.equal(removeResponse.name, assertionProjection);
      });
    },
    { timeout: 40 * 1000 }
  );

  describe(
    'Global Projections Operations',
    () => {
      it('Should enable all projections', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        await client.projections.enableAll();
        await sleep(1000);

        const projectionsInfo = await client.projections.getAllProjectionsInfo();
        projectionsInfo.projections.forEach((projection) => {
          assert.equal(projection.status.toLowerCase().includes('running'), true);
        });
      });

      it('Should disable all projections', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        await client.projections.disableAll();
        await sleep(1000);

        const projectionsInfo = await client.projections.getAllProjectionsInfo();
        projectionsInfo.projections.forEach((projection) => {
          assert.equal(projection.status.toLowerCase().includes('stopped'), true);
        });
      });
    },
    { timeout: 40 * 1000 }
  );

  describe(
    'General',
    () => {
      it('Should return all kurrentdb projections information', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const projectionsInfo = await client.projections.getAllProjectionsInfo();
        assert.notEqual(projectionsInfo, undefined);
        assert(projectionsInfo.projections.length > 0);
      });

      it('Should return state for test projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const projectionName = 'TestProjection';
        const projectionContent = fs.readFileSync(`${__dirname}/support/testProjection.js`, {
          encoding: 'utf8'
        });

        await client.projections.assert(projectionName, projectionContent);
        await sleep(500);

        const testStream = `TestProjectionStream-${generateEventId()}`;
        await client.writeEvent(testStream, 'TestProjectionEventType', {
          something: '123'
        });

        await sleep(1000);
        const projectionState = await client.projections.getState(projectionName);
        assert.equal(projectionState.data.something, '123');

        const stopResponse = await client.projections.stop(projectionName);
        assert.equal(stopResponse.name, projectionName);
        const removeResponse = await client.projections.remove(projectionName);
        assert.equal(removeResponse.name, projectionName);
      });

      it('Should return state for partitioned test projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const projectionName = `TestProjection${generateEventId()}`;
        const projectionContent = fs.readFileSync(`${__dirname}/support/testPartitionedProjection.js`, {
          encoding: 'utf8'
        });

        await client.projections.assert(projectionName, projectionContent);
        await sleep(500);

        const testStream = `TestProjectionStream-${generateEventId()}`;
        await client.writeEvent(testStream, 'TestProjectionEventType', {
          something: '123'
        });

        await sleep(4000);
        const options = {
          partition: testStream
        };

        const projectionState = await client.projections.getState(projectionName, options);
        assert.equal(projectionState.data.something, '123');

        const stopResponse = await client.projections.stop(projectionName);
        assert.equal(stopResponse.name, projectionName);
        const removeResponse = await client.projections.remove(projectionName);
        assert.equal(removeResponse.name, projectionName);
      });

      it('Should return 404 for non-existent projection when requesting state', () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());
        return client.projections
          .getState('SomeProjectionNameThatDoesNotExist')
          .catch((err) => assert(err.response.status, 404));
      });

      it('Should return result for test projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const projectionName = 'TestProjection';
        const projectionContent = fs.readFileSync(`${__dirname}/support/testProjection.js`, {
          encoding: 'utf8'
        });

        await client.projections.assert(projectionName, projectionContent);
        await sleep(500);

        const testStream = `TestProjectionStream-${generateEventId()}`;
        await client.writeEvent(testStream, 'TestProjectionEventType', {
          something: '123'
        });

        await sleep(1000);
        const projectionState = await client.projections.getResult(projectionName);
        assert.equal(projectionState.data, '321');

        const stopResponse = await client.projections.stop(projectionName);
        assert.equal(stopResponse.name, projectionName);
        const removeResponse = await client.projections.remove(projectionName);
        assert.equal(removeResponse.name, projectionName);
      });

      it('Should return result for partitioned test projection', async () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());

        const projectionName = `TestProjection${generateEventId()}`;
        const projectionContent = fs.readFileSync(`${__dirname}/support/testPartitionedProjection.js`, {
          encoding: 'utf8'
        });

        await client.projections.assert(projectionName, projectionContent);
        await sleep(500);

        const testStream = `TestProjectionStream-${generateEventId()}`;
        await client.writeEvent(testStream, 'TestProjectionEventType', {
          something: '123'
        });

        await sleep(4000);
        const options = {
          partition: testStream
        };

        const projectionState = await client.projections.getResult(projectionName, options);
        assert.equal(projectionState.data, '321');

        const stopResponse = await client.projections.stop(projectionName);
        assert.equal(stopResponse.name, projectionName);
        const removeResponse = await client.projections.remove(projectionName);
        assert.equal(removeResponse.name, projectionName);
      });

      it('Should return 404 for non-existent projection when requesting result', () => {
        const client = new KurrentDB.HTTPClient(getHttpConfig());
        return client.projections
          .getResult('SomeProjectionNameThatDoesNotExist')
          .catch((err) => assert(err.response.status, 404));
      });
    },
    { timeout: 40 * 1000 }
  );
});
