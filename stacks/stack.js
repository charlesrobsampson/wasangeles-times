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
  const stations = new Table(stack, 'stations', {
    fields: {
      region: 'string',
      stationId: 'string'
    },
    primaryIndex: {
      partitionKey: 'region',
      sortKey: 'stationId'
    },
  });
	const readings = new Table(stack, 'readings', {
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
          timeout: '30 seconds',
					handler: 'functions/dash.main',
					permissions: [
            avy,
            stations,
						readings
          ],
          config: [
            OBSERVATION_TOKEN
          ],
					environment: {
            avyTableName: avy.tableName,
            stationsTableName: stations.tableName,
						readingsTableName: readings.tableName
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
  new Cron(stack, "updateWeatherStations", {
    // schedule: "rate(1 minute)", // for testing
		schedule: 'cron(0 0 ? 10-6 SUN *)',// every Sunday at midnight utc oct - june
    job: {
      function: {
        timeout: '30 seconds',
        handler: "functions/updateWeatherStations.main",
        permissions: [stations],
        environment: { stationsTableName: stations.tableName }
      }
    },
    enabled: true
  });
	new Cron(stack, "getWeather", {
		schedule: 'cron(3 10-4 * 10-6 ? *)',// every hour during day mst
		job: {
			function: {
				handler: "functions/getWeather.main",
				permissions: [
					stations,
					readings
				],
				config: [
					OBSERVATION_TOKEN
				],
				environment: {
					stationsTableName: stations.tableName,
					readingsTableName: readings.tableName
				}
			}
		},
		enabled: true
	});

  stack.addOutputs({
    ApiEndpoint: dash.url,
  });
}
