import './bootstrap';
import './models';
import 'express-async-errors';
import express from 'express';

import ErrorHandler from './shared/utils/errorHandler';
import CorsMiddleware from './shared/middlewares/cors';
import LoggerMiddleware from './shared/middlewares/logger';

import routes from './routes';
import './setup/sentry';

export const app = express();

app.use(express.json());
app.use(CorsMiddleware);
app.use(LoggerMiddleware);
app.use(routes);
app.use(ErrorHandler);
