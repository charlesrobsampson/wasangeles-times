import _ from 'lodash';

export default function handler(lambda) {
  return async function (event, context) {
    let body, statusCode;

    try {
      body = await lambda(event, context);
      statusCode = 200;
    } catch (e) {
      body = { error: e.message };
      statusCode = e.statusCode || 500;
    }

    const allowedOrigins = ['http://localhost:3000'];

    const headers = {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      // 'Access-Control-Allow-Origin': '*'
    };

    if (_.includes(allowedOrigins, _.get(event, 'headers.origin'))) {
      _.set(headers, ['Access-Control-Allow-Origin'], _.get(event, 'headers.origin'));
    }
    return {
      statusCode,
      headers,
      body: JSON.stringify(body),
    };
  }
};
