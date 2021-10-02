import './setup/db';

import { app } from './server';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.info(`Rodando na porta ${PORT} Faça bom proveito do sistema de agendamentos 🚀📅💈`);
});
