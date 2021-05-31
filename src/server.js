require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('express-async-errors');

const app = express();
require('./setup/db');

const routes = require('./routes');
const logger = require('./setup/logger');
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(routes);
app.use((error, req, res, next) => {
  console.error(error);
  res.sendStatus(500);
});

app.listen(port, () => {
  console.info(`Servidor rodando na porta ${port}`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.info('Faça bom proveito do sistema de agendamentos 🚀📅💈');
});
