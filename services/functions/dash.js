import handler from './lambda';
// import { getAvyForecast } from './getAvyForecast';
import { getObservation } from './getWeather';

export const main = handler(async (event, context) => {
	// await getAvyForecast()
	await getObservation('SBDU1', '2022-10-04T00:00:00-06:00', '2022-10-04T23:59:59-06:00');

	return {
		message: 'We could put a forecast summary here wih whatever info we find relevant'
	}
});
