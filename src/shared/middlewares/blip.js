import crypto from 'crypto';

export default function BlipMiddleware(req, res, next) {
  const signature = process.env.BLIP_SIGNATURE;

  const hashedSignature = crypto.createHash('sha256').update(signature).digest('hex');

  if (req.headers['x-blip-signature'] !== hashedSignature) {
    req.errorCode = 403;
    throw new Error('Apenas contas permitidas podem acessar essa rota.');
  }

  next();
}
