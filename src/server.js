import './bootstrap';
import './models';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { errorHandler } from './shared/utils/errorHandler';

import routes from './routes';

export const app = express();

Sentry.init({
  dsn: 'https://c7685a2223fa4d5a9b147b1b7cb3c50e@o770029.ingest.sentry.io/5795339',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  environment: process.env.SENTRY_ENVIROMENT,
});

app.use(cors());
app.use(express.json());

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use((error, req, res, next) => {
  errorHandler(error, req, res);
});
