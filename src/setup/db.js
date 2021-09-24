import '../bootstrap';
import mongoose from 'mongoose';

const { DB_URI, DB_USER, DB_PASS } = process.env;

mongoose.connect(DB_URI, {
  user: DB_USER,
  pass: DB_PASS,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  readPreference: 'primary',
  w: 'majority',
  authSource: 'admin',
  dbName: 'web_agenda',
})
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(() => console.log('Erro ao conectar ao MongoDB'));
