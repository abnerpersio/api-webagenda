import crypto from 'crypto';
import '../bootstrap';

export const hash = (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(16).toString('hex');

  crypto.scrypt(password, salt, 64, (err, derivedKey) => {
    if (err) reject(err.message);
    resolve(`${salt}:${derivedKey.toString('hex')}`);
  });
});

export const verifyPassword = (password, hashedPass) => new Promise((resolve, reject) => {
  const [salt, key] = hashedPass.split(':');
  crypto.scrypt(password, salt, 64, (err, derivedKey) => {
    if (err) reject(err);

    const keyBuffer = Buffer.from(key, 'hex');
    resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
  });
});
