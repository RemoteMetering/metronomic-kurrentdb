import cloneDeep from 'lodash.clonedeep';
import assert from 'assert';
import url from 'url';
import persistentSubscriptionGetStreamSubscriptionsInfo from './persistentSubscriptions/getStreamSubscriptionsInfo.js';
import persistentSubscriptionGetAllSubscriptionsInfo from './persistentSubscriptions/getAllSubscriptionsInfo.js';
import persistentSubscriptionGetSubscriptionInfo from './persistentSubscriptions/getSubscriptionInfo.js';
import persistentSubscriptionGetEvents from './persistentSubscriptions/getEvents.js';
import projectionGetAllProjectionsInfo from './projections/getAllProjectionsInfo.js';
import persistentSubscriptionAssert from './persistentSubscriptions/assert.js';
import persistentSubscriptionRemove from './persistentSubscriptions/remove.js';
import sendScavengeCommand from './admin/sendScavengeCommand.js';
import sendShutdownCommand from './admin/sendShutdownCommand.js';
import createHttpClient from '../utilities/createHttpClient.js';
import projectionDisableAll from './projections/disableAll.js';
import projectionEnableAll from './projections/enableAll.js';
import projectionGetState from './projections/getState.js';
import projectionGetResult from './projections/getResult.js';
import getAllStreamEvents from './getAllStreamEvents.js';
import projectionGetInfo from './projections/getInfo.js';
import checkStreamExists from './checkStreamExists.js';
import projectionAssert from './projections/assert.js';
import projectionRemove from './projections/remove.js';
import projectionConfig from './projections/config.js';
import projectionStart from './projections/start.js';
import projectionReset from './projections/reset.js';
import projectionStop from './projections/stop.js';
import getEventsByType from './getEventsByType.js';
import deleteStream from './deleteStream.js';
import writeEvents from './writeEvents.js';
import writeEvent from './writeEvent.js';
import readEvents from './readEvents.js';
import getEvents from './getEvents.js';
import ping from './ping.js';

const baseErr = 'metronomic-kurrentdb-promise - HTTP client - ';

export default class HTTPClient {
  constructor(config) {
    assert(config, `${baseErr}config not provided`);
    assert(config.hostname, `${baseErr}hostname property not provided`);
    assert(config.port, `${baseErr}port property not provided`);
    assert(config.credentials, `${baseErr}credentials property not provided`);
    assert(config.credentials.username, `${baseErr}credentials.username property not provided`);
    assert(config.credentials.password, `${baseErr}credentials.password property not provided`);
    if (config.timeout) assert(typeof config.timeout === 'number', `${baseErr}timeout not defined`);

    // Add additional internal configuration properties
    const instanceConfig = cloneDeep(config);
    instanceConfig.protocol = instanceConfig.protocol || 'http';
    instanceConfig.auth = `${instanceConfig.credentials.username}:${instanceConfig.credentials.password}`;
    instanceConfig.baseUrl = url.format(instanceConfig);
    if (instanceConfig.protocol === 'https')
      instanceConfig.validateServer =
        instanceConfig.validateServer === undefined || instanceConfig.validateServer === null
          ? true
          : instanceConfig.validateServer;

    const httpClient = createHttpClient(instanceConfig);

    const _getAllProjectionsInfo = projectionGetAllProjectionsInfo(instanceConfig, httpClient);
    const _getConfig = projectionConfig(instanceConfig, httpClient);
    const _startProjection = projectionStart(instanceConfig, httpClient);
    const _stopProjection = projectionStop(instanceConfig, httpClient);

    this.checkStreamExists = checkStreamExists(instanceConfig, httpClient);
    this.writeEvent = writeEvent(instanceConfig, httpClient);
    this.writeEvents = writeEvents(instanceConfig, httpClient);
    this.getAllStreamEvents = getAllStreamEvents(instanceConfig, httpClient);
    this.readEventsForward = readEvents(instanceConfig, httpClient, 'forward');
    this.readEventsBackward = readEvents(instanceConfig, httpClient, 'backward');
    this.getEvents = getEvents(this.readEventsForward, this.readEventsBackward);
    this.getEventsByType = getEventsByType(this.getEvents);
    this.deleteStream = deleteStream(instanceConfig, httpClient, this.checkStreamExists);
    this.ping = ping(instanceConfig, httpClient);
    this.admin = {
      scavenge: sendScavengeCommand(instanceConfig, httpClient),
      shutdown: sendShutdownCommand(instanceConfig, httpClient)
    };
    this.projections = {
      start: _startProjection,
      stop: _stopProjection,
      reset: projectionReset(instanceConfig, httpClient),
      remove: projectionRemove(instanceConfig, httpClient),
      getAllProjectionsInfo: _getAllProjectionsInfo,
      getState: projectionGetState(instanceConfig, httpClient),
      getResult: projectionGetResult(instanceConfig, httpClient),
      config: projectionConfig(instanceConfig, httpClient),
      getInfo: projectionGetInfo(_getAllProjectionsInfo, _getConfig),
      assert: projectionAssert(instanceConfig, httpClient, _getAllProjectionsInfo),
      disableAll: projectionDisableAll(_getAllProjectionsInfo, _stopProjection),
      enableAll: projectionEnableAll(_getAllProjectionsInfo, _startProjection)
    };
    this.persistentSubscriptions = {
      assert: persistentSubscriptionAssert(instanceConfig, httpClient),
      remove: persistentSubscriptionRemove(instanceConfig, httpClient),
      getEvents: persistentSubscriptionGetEvents(instanceConfig, httpClient),
      getSubscriptionInfo: persistentSubscriptionGetSubscriptionInfo(instanceConfig, httpClient),
      getAllSubscriptionsInfo: persistentSubscriptionGetAllSubscriptionsInfo(instanceConfig, httpClient),
      getStreamSubscriptionsInfo: persistentSubscriptionGetStreamSubscriptionsInfo(instanceConfig, httpClient)
    };
  }
}
