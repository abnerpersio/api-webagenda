require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
require('express-async-errors');

const app = express();
require('./setup/db');

Sentry.init({
  dsn: 'https://c7685a2223fa4d5a9b147b1b7cb3c50e@o770029.ingest.sentry.io/5795339',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],

  tracesSampleRate: 1.0,
});

const routes = require('./routes');
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
//  Sentry logger service
if (process.env.NODE_ENV !== 'dev') {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}
//  Sentry logger service
app.use(routes);

//  Sentry error handler service
if (process.env.NODE_ENV !== 'dev') {
  app.use(Sentry.Handlers.errorHandler());
}
//  Sentry error handler service
app.use((error, req, res, next) => {
  console.error(error);
  console.log('deu ruim aqui', error)
  res.sendStatus(500);
});

app.listen(port, () => {
  console.info(`Servidor rodando na porta ${port}`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.info('Faça bom proveito do sistema de agendamentos 🚀📅💈');
});
