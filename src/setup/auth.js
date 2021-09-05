import mongoose from 'mongoose';
import moment from 'moment-timezone';
import { getToken, verifyToken } from './jwt';
import { verifyPassword } from './crypto';
import { freeHoursJsonFormat } from '../shared/utils/freeHoursCalculate';
import 'moment/locale/pt-br';

const User = mongoose.model('User');

export const authMiddleware = async (req, res, next) => {
  // auth with token
  if (req.headers.authorization && req.headers['x-wa-username']) {
    const { authorization } = req.headers;
    const [, token] = authorization.split(' ');

    try {
      const decodedData = verifyToken(token);

      if (decodedData.username !== req.headers['x-wa-username']) {
        req.errorCode = 401;
        throw new Error('credenciais invalidas');
      }

      const authorized = await User.findById(decodedData.id);

      if (authorized) {
        const freeHours = await freeHoursJsonFormat({
          userId: decodedData.id,
          eventdate: moment().format('DD/MM/YYYY'),
        });

        req.auth = {
          username: authorized.username,
          id: authorized._id,
          role: authorized.role,
          token,
          schedule: authorized.schedule,
          services: authorized.services,
          professional: authorized.professional,
          freeHours,
        };

        next();
        return;
      }

      req.errorCode = 401;
      throw new Error('credenciais invalidas');
    } catch (err) {
      if (err.message === 'jwt expired' || req.errorCode === 401) {
        req.errorCode = 401;
        throw new Error('credenciais invalidas');
      }

      throw err;
    }
  }

  // auth with no token
  if (req.headers['x-wa-username'] && req.headers['x-wa-password']) {
    const userExists = await User.findOne({
      username: req.headers['x-wa-username'],
    }).select('+password');

    if (!userExists) {
      req.errorCode = 400;
      throw new Error('usuario não existe');
    }

    const authorized = verifyPassword(req.headers['x-wa-password'], userExists.password);

    if (authorized) {
      req.auth = {
        username: userExists.username,
        id: userExists._id,
        role: userExists.role,
        token: getToken({
          id: userExists._id,
          username: userExists.username,
        }),
      };

      next();
      return;
    }

    req.statusCode = 401;
    throw new Error('credenciais invalidas');
  }

  req.statusCode = 400;
  throw new Error('As credenciais estão faltando');
};

export const login = async (req, res) => res.json(req.auth);
