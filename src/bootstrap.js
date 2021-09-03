import { config } from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'dev';

config({
  path: NODE_ENV === 'dev' ? '.env.dev' : '.env',
});
