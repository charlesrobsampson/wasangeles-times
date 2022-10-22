import _ from 'lodash';

export function makeQueryString(params) {
	let query = '';
	for (let i = 0; i < params.length; i++) {
		const and = i === 0 ? '' : '&';
		query = `${query}${and}${_.get(params[i], 'key')}=${_.get(params[i], 'value')}`;
	}
	return query;
}

const cardinal = [
	'N', 'NNE', 'NE', 'ENE',
	'E', 'ESE', 'SE', 'SSE',
	'S', 'SSW', 'SW', 'WNW',
	'W', 'WNW', 'NW', 'NNW',
	'N'
];

export function toCardinal(deg) {
	let dir = deg % 360;
	let index = Math.round(dir / 22.5, 0);
	return cardinal[index];
}

export function toDegrees(dir) {
	const index = cardinal.indexOf(dir);
	if (index === -1) {
		return 'Unknown Direction';
	} else {
		return index * 22.5;
	}
}

export function inside(point, vs) {
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