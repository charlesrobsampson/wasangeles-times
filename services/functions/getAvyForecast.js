import handler from './lambda';
import axios from 'axios';
import { getReading, saveReading } from '../utils/dynamoUtils';
import moment from 'moment-timezone';
import _ from 'lodash';
import Promise from 'bluebird';

const regions = ['salt-lake'];
const tz = 'America/Denver';

export const main = handler(async (event, context) => {
	return 'AVY FORECAST';
});

export async function getAvyForecast() {
	const today = moment().tz(tz).format('YYYY-MM-DD');
	await Promise.each(regions, async (region) => {
		const reading = await getReading({
			day: today,
			sk: `avy_forecast#${region}`
		});
		if (_.size(reading) === 0) {
			const url = `https://utahavalanchecenter.org/forecast/${region}/json`;
			const forecast = await axios.get(url);
			console.log(`---${region} forecast---`);
			console.dir(forecast.data, { depth: null });
			const advisory = _.get(forecast, 'data.advisories[0].advisory');
			console.log('---advisory---');
			console.dir(advisory, { depth: null });
			const timestamp = _.get(advisory, 'date_issued_timestamp');
			const day = moment.unix(timestamp).tz(tz).format('YYYY-MM-DD');
			if (day === today) {
				await saveReading({
					day,
					sk: `avy_forecast#${region}`,
					...advisory
				});
			}
		}
	});
}
