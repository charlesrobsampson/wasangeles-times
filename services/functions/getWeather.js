// API DOCS from weather.gov
// https://www.weather.gov/documentation/services-web-api#/default/station_observation_list
// from synoptic data
// https://developers.synopticdata.com/mesonet/v2/
import { Config } from "@serverless-stack/node/config";
import handler from './lambda';
import axios from 'axios';
import { getReading, saveReading } from '../utils/dynamoUtils';
import moment from 'moment-timezone';
import _ from 'lodash';
import Promise from 'bluebird';
import * as utils from '../utils/utils';

const slcStations = [
  'PC064', 'COOPATAU1', 'ATB',
  'CLN',   'AGD',       'AMB',
  'ALT',   'UTCDF',     'IFF',
  'E7377', 'HDP',       'MLDU1',
  '3278P', '3650P',     'PSUU1',
  'REY',   'SBDU1',     'SOLHP',
  'ELBUT', 'UTWLC'
];

const desiredFields = [
  'temperature',
  'windDirection',
  'windSpeed',
  'windGust',
  'barometricPressure',
  'seaLevelPressure',
  'visibility',
  'precipitationLast3Hours',
  'relativeHumidity',
  'windChill',
  'heatIndex',
  'cloudLayers'
];

export const main = handler(async (event, context) => {
  await getObservations('PSUU1', '2022-10-13T00:00:00-06:00', '2022-10-13T23:59:59-06:00');
});

export async function getObservations(station, start, end) {
  const params = [
		// {
		// 	key: 'stid',
		// 	value: station
		// },
		{
			key: 'units',
			value: 'english,speed|mph'
		},
		{
			key: 'start',
			value: start
		},
    {
			key: 'end',
			value: end
		},
		{
			key: 'token',
			value: Config.OBSERVATION_TOKEN
		}
	];
  params.push(station);
  // const url = `https://api.weather.gov/stations/${station}/observations?start=${start}&end=${end}`;
  // const url = `https://api.synopticdata.com/v2/stations/timeseries?state=ut&recent=120&token=${publicKey}`;
  const baseUrl = 'https://api.synopticdata.com/v2/stations/timeseries?';
	const url = `${baseUrl}${utils.makeQueryString(params)}`;
  console.log('---URL---\n', url);
  const res = await axios.get(url);
  console.log('---observations---');
  console.dir(res.data, { depth: null });
  let observations = _.get(res, 'data');
  let formattedPast = formatPast(observations);
  console.log('---FORMATTED PAST---');
  console.dir(formattedPast, { depth: null });
  // let observations = _.get(res, 'data.features');
  // const stationData = {};
  // _.set(stationData, 'coordinates', _.get(observations, '[0].geometry.coordinates'));
  // _.set(stationData, 'elevation', _.get(observations, '[0].properties.elevation'));
  // _.forEach(observations, (observation) => {
  //   let data = _.get(observation, 'properties');
  //   const timestamp = _.get(data, 'timestamp');
  //   const readings = _.pick(data, desiredFields);
  // });
  // console.log('---ENV VARS---');
  // console.dir(Config.OBSERVATION_TOKEN, { depth: null });
}

function formatPast(data) {
  let formattedPast = {};
  const units = _.get(data, 'UNITS');
  const stations = _.get(data, 'STATION');
  _.forEach(stations, (station) => {
    const reads = _.get(station, 'OBSERVATIONS');
    const timezone = _.get(station, 'TIMEZONE');
    const elevation = _.get(station, 'ELEVATION');
    const stationName = _.get(station, 'NAME');
    const stationId = _.get(station, 'STID');
    const sensors = _.get(station, 'SENSOR_VARIABLES');
    const latitude = _.get(station, 'LATITUDE');
    const longitude = _.get(station, 'LONGITUDE');
    let stationReadings = {};
    const { nameToSensor, sensorToName} = createNametoSensorMap(sensors);
    const times = _.get(reads, sensorToName.date_time);
    delete reads[sensorToName.date_time];
    for (let i = 0; i < times.length; i++) {
      _.forEach(reads, (readings, name) => {
        console.log({
          name,
          readings
        });
        const unit = _.get(units, nameToSensor[name]);
        _.set(stationReadings, `${times[i]}.${nameToSensor[name]}`, { value: readings[i] });
        if (unit) {
          _.set(stationReadings, `${times[i]}.${nameToSensor[name]}.unit`, unit);
        }
      });
    }
    formattedPast[stationId] = {
      name: stationName,
      id: stationId,
      latitude,
      longitude,
      elevation,
      timezone,
      readings: stationReadings
    };
  });
  return formattedPast;
}

function createNametoSensorMap(sensors) {
  let nameToSensor = {};
  let sensorToName = {};
  _.forEach(sensors, (name, sensor) => {
    const setName = _.first(_.keys(name));
    _.set(nameToSensor, setName, sensor);
    _.set(sensorToName, sensor, setName);
  });
  return { nameToSensor, sensorToName};
}