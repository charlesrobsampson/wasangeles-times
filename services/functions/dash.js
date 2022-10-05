import handler from './lambda';
import { getAvyForecast } from './getAvyForecast';

export const main = handler(async (event, context) => {
	await getAvyForecast()
	return {
		message: 'We could put a forecast summary here wih whatever info we find relevant'
	}
});
