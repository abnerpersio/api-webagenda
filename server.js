require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
require('./src/setup/db');

const { routesWithAuth, routesWithoutAuth } = require('./src/routes');
const logger = require('./src/setup/logger');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(routesWithoutAuth);
app.use(routesWithAuth);

app.listen(port, () => {
  console.info(`Servidor rodando na porta ${port}`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.info('Faça bom proveito do sistema de agendamentos 🚀📅💈');
});
