import crypto from 'crypto';
import '../bootstrap';

const required = (param) => {
  throw new Error(`Required ${param} param`);
};

export const hash = (password = required('password')) => crypto.createHash('sha256').update(password).digest('hex');

export const verifyPassword = (
  password = required('password'),
  hashedPass = required('hash'),
) => crypto.createHash('sha256').update(password).digest('hex') === hashedPass;
