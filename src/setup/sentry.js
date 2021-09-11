import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://c7685a2223fa4d5a9b147b1b7cb3c50e@o770029.ingest.sentry.io/5795339',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  environment: process.env.SENTRY_ENVIROMENT,
});
