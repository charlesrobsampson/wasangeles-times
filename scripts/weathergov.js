const axios = require('axios');
const _ = require('lodash');

const url = 'https://api.weather.gov'

const skiResorts = [
	'brighton',
	'alta',
	'snowbird',
	'solitude',
	'brian head',
	'sundance',
	'snow basin',
	'snow',
	'park city',
	'timp',
	'wolf',
	'eagle'
];
const saltLakeBox = [
	[40.815298, -111.891109],// NW corner
	[40.811784, -111.461973],// NE corner
	[40.464872, -111.855690],// SW corner
	[40.505482, -111.479777]// SE corner
];
const minEleft = 7000;
const mtoft = 3.28084;

async function getStations() {
	try {
	const res = await axios.get(`${url}/stations?state=UT`);
		console.log('---RES---')
		console.dir(res.data.features.length, { depth: null });
		let stations = _.get(res, 'data.features');
		stations = _.sortBy(stations, (s) => {
			return _.get(s, 'properties.name').toUpperCase();
		});
		console.dir(stations, { depth: null });
		let ct = 0;
		_.forEach(stations, (s) => {
			const id = _.get(s, 'id').substring(33);
			const name = _.get(s, 'properties.name');
			const ele = Math.floor(_.get(s, 'properties.elevation.value') * mtoft);
			const lonlat = _.get(s, 'geometry.coordinates');
			const latlon = _.reverse(lonlat);
			if (inside(latlon, saltLakeBox) && ele >= minEleft) {
			// if (includesString(name, skiResorts) || ele >= minEleft) {
				console.log(`${name} | ${id} | elevation: ${ele} | ${latlon}`);
				ct++;
			}
		});
		console.log('TOTAL: ', ct);
	} catch (e) {
		console.log('---ERROR---');
		console.dir(e, { depth: null });
	}
}

function includesString(needle, haystack) {
	_.forEach(haystack, (hay) => {
		if (needle.toLowerCase().indexOf(hay.toLowerCase()) !== -1) {
			return true;
		}
	});
	return false;
}
function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

getStations();
