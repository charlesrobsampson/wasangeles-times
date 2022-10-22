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
  // Get stations for each region
  // get time this was last run
  // get readings for each region from the last time run to now
  // save readings to db
  // update last run time
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
		const statUnits = _.get(station, 'UNITS');
    const reads = _.get(station, 'OBSERVATIONS');
    const timezone = _.get(station, 'TIMEZONE');
    const elevation = _.get(station, 'ELEVATION');
		const eUnit = _.get(statUnits, 'elevation');
    const stationName = _.get(station, 'NAME');
    const stationId = _.get(station, 'STID');
    const sensors = _.get(station, 'SENSOR_VARIABLES');
    const latitude = _.get(station, 'LATITUDE');
    const longitude = _.get(station, 'LONGITUDE');
    let stationReadings = {};
    const { nameToSensor, sensorToName} = createNametoSensorMap(sensors);
    const times = _.get(reads, sensorToName.date_time);
    delete reads[sensorToName.date_time];
		const from = moment(_.first(times)).unix();
		const to = moment(_.last(times)).unix();
		const diffSecs = to - from;
		let totals = {};
    for (let i = 0; i < times.length; i++) {
      _.forEach(reads, (readings, name) => {
				const snsr = nameToSensor[name];
        const unit = _.get(units, snsr);
				const t = times[i];
				let total = _.get(totals, `${snsr}.total`, 0);
				const value = readings[i];
				if (_.isNumber(value)) {
					if (snsr === 'wind_direction') {
						let ctw = _.get(totals, `${snsr}.wind_speed.ct`, 0) + 1;
						let ctg = _.get(totals, `${snsr}.wind_gust.ct`, 0) + 1;
						let totalxs = _.get(totals, `${snsr}.wind_speed.total.x`, 0);
						let totalys = _.get(totals, `${snsr}.wind_speed.total.y`, 0);
						let totalxg = _.get(totals, `${snsr}.wind_gust.total.x`, 0);
						let totalyg = _.get(totals, `${snsr}.wind_gust.total.y`, 0);
						const wspeed = _.get(reads, `${sensorToName['wind_speed']}[${i}]`);
						const wgust = _.get(reads, `${sensorToName['wind_gust']}[${i}]`);
						const xs = wspeed * Math.cos(value * (Math.PI / 180));
						const ys = wspeed * Math.sin(value * (Math.PI / 180));
						totalxs += xs;
						totalys += ys;
						_.set(totals, `${snsr}.wind_speed.total.x`, totalxs);
						_.set(totals, `${snsr}.wind_speed.total.y`, totalys);
						_.set(totals, `${snsr}.wind_speed.ct`, ctw);
						const xg = wgust * Math.cos(value * (Math.PI / 180));
						const yg = wgust * Math.sin(value * (Math.PI / 180));
						totalxg += xg;
						totalyg += yg;
						_.set(totals, `${snsr}.wind_gust.total.x`, totalxg);
						_.set(totals, `${snsr}.wind_gust.total.y`, totalyg);
						_.set(totals, `${snsr}.wind_gust.ct`, ctg);
					} else {
						let ct = _.get(totals, `${snsr}.ct`, 0) + 1;
						total += value;
						_.set(totals, `${snsr}.total`, total);
						_.set(totals, `${snsr}.ct`, ct);
					}
				}
        _.set(stationReadings, `${t}.${snsr}.value`, value);
        if (unit) {
          _.set(stationReadings, `${t}.${snsr}.unit`, unit);
        }
      });
    }
		let avgs = {};
		_.forEach(totals, (val, snsr) => {
			if (snsr === 'wind_direction') {
				_.forEach(val, ({total, ct}, type) => {
					const x = _.get(total, 'x', 0) / ct;
					const y = _.get(total, 'y', 0) / ct;
					let deg = _.toNumber((Math.atan(y / x) / (Math.PI / 180)).toFixed(2));
          if (deg < 0) {
            deg += 360;
          }
          if (deg >= 360) {
            deg -= 360;
          }
					_.set(avgs, `${snsr}.${type}.value`, _.toNumber(deg.toFixed(2)));
					_.set(avgs, `${snsr}.${type}.wind_cardinal_direction.value`, utils.toCardinal(deg));
				});
			} else {
				const { total, ct } = val;
				_.set(avgs, `${snsr}.value`, _.toNumber((total / ct).toFixed(2)));
			}
			_.set(avgs, `${snsr}.unit`, units[snsr]);
		});
		_.set(avgs, 'last.duration', diffSecs);
		_.set(avgs, 'last.unit', 'seconds');
    formattedPast[stationId] = {
      name: stationName,
      id: stationId,
      latitude,
      longitude,
      elevation: {
				value: elevation,
				units: eUnit
			},
      timezone,
      readings: stationReadings,
			averages: avgs
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
