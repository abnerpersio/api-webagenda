import './setup/db';

import { app } from './server';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.info('Faça bom proveito do sistema de agendamentos 🚀📅💈');
  console.info(`Server rodando na porta ${PORT}`);
});
