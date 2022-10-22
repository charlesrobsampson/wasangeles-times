import handler from './lambda';
// import { getAvyForecast } from './getAvyForecast';
// import { getObservations } from './getWeather';
import { updateWeatherStations } from './updateWeatherStations';
// import moment from 'moment-timezone';

export const main = handler(async (event, context) => {
	// await getAvyForecast()
	// This doesn't appear to get the right time in UTC
	// const now = moment.utc().unix();
	// // This doesn't seem to be subtracting anything from now
	// const timeAgo = now - (3 * 60 * 60);
	// // MESONET FORMAT
	// // YYYYMMDDHHmm
	// const current = moment.utc(now * 1000).format('YYYYMMDDHHmm');
	// const pastTim = moment.utc(timeAgo * 1000).format('YYYYMMDDHHmm');
	// // const current = moment.utc(now * 1000).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
	// // const pastTim = moment.utc(timeAgo * 1000).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
	// console.log('---NOW---\n', moment.utc(now * 1000).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
	// console.log('--4 HOURS AGO---\n', moment.utc(timeAgo * 1000).format('YYYY-MM-DDTHH:mm:ss') + 'Z');
	// // console.log('---TIME ZONE---\n', moment.tz.guess());
	// await getObservations({
	// 	key: 'stid',
	// 	value: 'ATB'
	// 	// key: 'bbox',
	// 	// value: '-111.891109,40.464872,-111.461973,40.815298'
	// 	// [lonmin,latmin,lonmax,latmax]
	// },
	// pastTim, current);

	await updateWeatherStations();

	return {
		message: 'We could put a forecast summary here wih whatever info we find relevant'
	}
});
