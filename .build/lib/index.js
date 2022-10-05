import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// stacks/stack.js
import {
  Api,
  Table,
  Cron
} from "@serverless-stack/resources";
function stack({ stack: stack2 }) {
  const avy = new Table(stack2, "avy", {
    fields: {
      day: "string",
      sk: "string"
    },
    primaryIndex: {
      partitionKey: "day",
      sortKey: "sk"
    }
  });
  const dash = new Api(stack2, "dash", {
    routes: {
      "GET /": {
        function: {
          handler: "functions/dash.main",
          permissions: [avy],
          environment: { avyTableName: avy.tableName }
        }
      }
    }
  });
  new Cron(stack2, "getAvyForecast", {
    schedule: "cron(0/15 10-15 * 10-6 ? *)",
    job: {
      function: {
        handler: "functions/getAvyForecast.main",
        permissions: [avy],
        environment: { avyTableName: avy.tableName }
      }
    },
    enabled: false
  });
  stack2.addOutputs({
    ApiEndpoint: dash.url
  });
}
__name(stack, "stack");

// stacks/index.js
import { App } from "@serverless-stack/resources";
function stacks_default(app) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm"
    }
  });
  app.stack(stack);
}
__name(stacks_default, "default");
export {
  stacks_default as default
};
//# sourceMappingURL=index.js.map
