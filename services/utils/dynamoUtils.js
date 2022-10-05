import { DynamoDB } from "aws-sdk";
import _ from 'lodash';

const dynamoDb = new DynamoDB.DocumentClient();

export async function getReading(reading) {
	const params = {
		TableName: process.env.avyTableName,
			Key: {
				day: _.get(reading, 'day'),
				sk: _.get(reading, 'sk')
			}
	};
	const results = await dynamoDb.get(params).promise();
	return _.get(results, 'Item');
}

export async function saveReading(reading) {
	const params = {
		TableName: process.env.avyTableName,
		Item: {
			...reading
		}
	};
	await dynamoDb.put(params).promise();
}

export async function getDay(day) {
	const params = {
		TableName: process.env.avyTableName,
		KeyConditionExpression: '#pk = :day',
		ExpressionAttributeNames:{
			'#pk': 'day'
		},
		ExpressionAttributeValues: {
			':day': day
    	}
	};
	const results = await dynamoDb.query(params).promise();
	return _.get(results, 'Items');
}
