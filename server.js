require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
require('./src/setup/db');

const routes = require('./src/routes');
const authMiddleware = require('./src/setup/auth').authMiddleware;
const logger = require('./src/setup/logger');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);
app.use(logger);
app.use(routes);

app.listen(port, () => {
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.info(`Servidor rodando na porta ${port}`);
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.info('Faça bom proveito do sistema de agendamentos 🚀📅💈');
});
