// API DOCS from weather.gov
// https://www.weather.gov/documentation/services-web-api#/default/station_observation_list
// from synoptic data
// https://developers.synopticdata.com/mesonet/v2/
// import { Config } from "@serverless-stack/node/config";
import handler from './lambda';
import axios from 'axios';
// import { getReading, saveReading } from '../utils/dynamoUtils';
// import moment from 'moment-timezone';
import _ from 'lodash';
import Promise from 'bluebird';
import * as utils from '../utils/utils';
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

// const regions = ['logan', 'ogden', 'uintas', 'salt-lake', 'provo', 'skyline', 'moab', 'abajos', 'southwest'];

const regionBoxes = {
    'salt-lake': [
        [40.815298, -111.891109],// NW corner
        [40.811784, -111.461973],// NE corner
        [40.464872, -111.855690],// SW corner
        [40.505482, -111.479777]// SE corner
    ]
};

const minEleft = 7000;
const mtoft = 3.28084;

export const main = handler(async (event, context) => {
    updateWeatherStations();
});

export async function updateWeatherStations() {
    const url = 'https://api.weather.gov'
	const res = await axios.get(`${url}/stations?state=UT`);
    let stations = _.get(res, 'data.features');
    await Promise.map(stations, async (s) => {
        const stationId = _.get(s, 'properties.stationIdentifier');
        const name = _.get(s, 'properties.name');
        const elevation = Math.floor(_.get(s, 'properties.elevation.value') * mtoft);
        const [longitude, latitude] = _.get(s, 'geometry.coordinates');
        const regions = getRegions(latitude, longitude);
        if (regions && elevation >= minEleft) {
            await Promise.map(regions, async (region) => {
            	await dynamoDb.put({
                    TableName: process.env.stationsTableName,
                    Item: {
                        name,
                        stationId,
                        elevation,
                        latitude,
                        longitude,
                        region
                    }
                }).promise();
            }, { concurrency: 10 });
        }
    }, { concurrency: 10 });
}

function getRegions(lat, lon) {
    let regions = [];
    _.forEach(regionBoxes, (box, region) => {
        if (utils.inside([lat, lon], box)) {
            regions.push(region);
        }
    });
    if (regions.length === 0) {
        return false;
    } else {
        return regions;
    }
}