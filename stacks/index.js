import secrets from './secrets';
import { stack } from './stack';
import { App } from '@serverless-stack/resources';
// import * as dotenv from 'dotenv';

// dotenv.config({ debug: true, override: true });

/**
 * @param {App} app
 */
export default function (app) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    srcPath: 'services',
    bundle: {
      format: 'esm',
    },
  });
  app.stack(secrets);
  app.stack(stack);
}
