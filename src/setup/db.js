import '../bootstrap';
import mongoose from 'mongoose';

const uri = process.env.DB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  dbName: 'web_agenda',
})
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(() => console.log('Erro ao conectar ao MongoDB'));
