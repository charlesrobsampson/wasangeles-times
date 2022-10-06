// API DOCS
// https://www.weather.gov/documentation/services-web-api#/default/station_observation_list
import handler from './lambda';
import axios from 'axios';
import { getReading, saveReading } from '../utils/dynamoUtils';
import moment from 'moment-timezone';
import _ from 'lodash';
import Promise from 'bluebird';

const slcStations = [
    'PC064', 'COOPATAU1', 'ATB',
    'CLN',   'AGD',       'AMB',
    'ALT',   'UTCDF',     'IFF',
    'E7377', 'HDP',       'MLDU1',
    '3278P', '3650P',     'PSUU1',
    'REY',   'SBDU1',     'SOLHP',
    'ELBUT', 'UTWLC'
  ];

export const main = handler(async (event, context) => {
  await getObservation('ATB', '2022-10-04T00:00:00-06:00', '2022-10-04T23:59:59-06:00');
});

export async function getObservation(station, start, end) {
  const url = `https://api.weather.gov/stations/${station}/observations?start=${start}&end=${end}`;
  const res = await axios.get(url);
  console.log('---RES---');
  console.dir(res.data.features, { depth: null });
}