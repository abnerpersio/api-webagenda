require('dotenv').config();
const express = require('express');
const routesWithAuth = express.Router();
const routesWithoutAuth = express.Router();

const UserController = require('./controllers/UserController');
const ScheduleController = require('./controllers/ScheduleController');
const { getFreeHours } = require('./webhooks/freeHours');
const { getId } = require('./webhooks/getChatId');
const { getService } = require('./webhooks/services');
const { authMiddleware, login } = require('./setup/auth');

const adminVerify = (req, res, next) => {
  if (
    req.headers.username == process.env.ADMIN_USER &&
    req.headers.password == process.env.ADMIN_PASS
  ) {
    next();
  } else {
    return res.status(401).end('EI, VOCE NAO ESTA AUTORIZADO NESSA ROTA!');
  }
};

routesWithAuth.use(authMiddleware);

routesWithAuth.get('/ping', (req, res) => res.send('pong!'));

routesWithAuth.get('/users', adminVerify, UserController.findIdByName);

routesWithAuth.get('/users/:id', UserController.show);
routesWithAuth.post('/users', adminVerify, UserController.create);
routesWithAuth.put('/users/:id', UserController.update);
routesWithAuth.post('/users/:id/horarios', UserController.addSpecialOpening);
routesWithAuth.post('/users/:id/closed', UserController.addSpecialClose);
routesWithAuth.post('/users/:id/services', UserController.addService);

routesWithAuth.post('/groups/', UserController.newGroup);
routesWithAuth.put('/groups/:groupId', UserController.updateGroup);

routesWithAuth.get('/login', login);

routesWithAuth.get('/events', ScheduleController.list);
routesWithAuth.get('/events/:event', ScheduleController.show);
routesWithAuth.post('/events', ScheduleController.create);
routesWithAuth.put('/events/:event', ScheduleController.update);
routesWithAuth.delete('/events/:event', ScheduleController.delete);

routesWithAuth.get('/webhooks/freehours', getFreeHours);
routesWithoutAuth.get('/webhooks/chatid', getId);
routesWithoutAuth.get('/webhooks/services', getService);

// didn't work in frontend w/ react, later i will see and solve that.

routesWithAuth.use('*', (req, res) =>
  res.status(404).json({ message: 'Rota não encontrada!' })
);

module.exports = { routesWithAuth, routesWithoutAuth };
