import debugModule from 'debug';

const debug = debugModule('metronomic-kurrentdb:getAllProjectionsInfo');

export default (config, httpClient) => async () => {
  const response = await httpClient.get(`${config.baseUrl}/projections/all-non-transient`);
  debug('', 'Response: %j', response.data);
  return response.data;
};
