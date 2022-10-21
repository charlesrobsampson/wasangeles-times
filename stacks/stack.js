import {
  Api,
  Table,
  Cron,
  use,
} from '@serverless-stack/resources';
import secrets from "./secrets";

export function stack({ stack }) {
  const {
    OBSERVATION_TOKEN
  } = use(secrets);
  const avy = new Table(stack, 'avy', {
    fields: {
      day: 'string',
      sk: 'string'
    },
    primaryIndex: {
      partitionKey: 'day',
      sortKey: 'sk'
    },
  });
  const dash = new Api(stack, 'dash', {
    routes: {
      'GET /': {
				function: {
					handler: 'functions/dash.main',
					permissions: [avy],
          config: [
            OBSERVATION_TOKEN
          ],
					environment: {
            avyTableName: avy.tableName
           }
				}
			}
		}
  });
  new Cron(stack, "getAvyForecast", {
    // schedule: "rate(1 minute)", // for testing
    //schedule: "rate(30 minutes)", // for prod this needs to only run every 15 mins from 5 am to 8 am MST during the season Oct - June?
		schedule: 'cron(0/15 10-15 * 10-6 ? *)', // This is in UTC so 10 - 15 should convert to 4 - 9 MST I gave it an hour on each side cuz I didn't want to think about daylight savings
    job: {
      function: {
        handler: "functions/getAvyForecast.main",
        permissions: [avy],
        environment: { avyTableName: avy.tableName }
      }
    },
    enabled: false
  });

  stack.addOutputs({
    ApiEndpoint: dash.url,
  });
}
