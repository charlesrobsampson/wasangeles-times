import {
  Api,
  Table,
  Cron,
} from '@serverless-stack/resources';

export function stack({ stack }) {
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
					environment: { avyTableName: avy.tableName }
				}
			}
		}
  });
  new Cron(stack, "getAvyForecast", {
    // schedule: "rate(1 minute)", // for testing
    //schedule: "rate(30 minutes)", // for prod this needs to only run every 15 mins from 5 am to 8 am MST during the season Oct - June?
		schedule: 'cron(0/15 10-15 * 10-6 ? *)',
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
