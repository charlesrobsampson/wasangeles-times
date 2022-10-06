const axios = require('axios');
const _ = require('lodash');

const url = 'https://api.weather.gov'

async function getStations() {
	try {
	const res = await axios.get(`${url}/stations?state=UT`);
		console.log('---RES---')
		console.dir(res.data.features.length, { depth: null });
		let stations = _.get(res, 'data.features');
		stations = stations.sort((a, b) => {
			return a.properties.name.toUpperCase() - b.properties.name.toUpperCase();
		});
		console.log(stations);
		_.forEach(stations, (s) => {
			const id = _.get(s, 'id').substring(33);
			const name = _.get(s, 'properties.name');
			console.log(`${name} - ${id}`);
		});
	} catch (e) {
		console.log('---ERROR---');
		console.dir(e, { dwpth: null });
	}
}

getStations();
