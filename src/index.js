import './setup/db';

import { app } from './server';

app.listen(process.env.PORT || 8080, () => {
  console.info('Faça bom proveito do sistema de agendamentos 🚀📅💈');
});
