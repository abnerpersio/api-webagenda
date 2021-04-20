require('dotenv').config();
const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');
const ScheduleController = require('./controllers/ScheduleController');
const freeHoursHook = require('./webhooks/freeHours');
// const getChat = require('./webhooks/getChatId');
const Auth = require('./setup/auth');

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

routes.get('/ping', (req, res) => res.send('pong!'));

routes.get('/users', adminVerify, UserController.findIdByName);

routes.get('/users/:id', UserController.show);
routes.post('/users', adminVerify, UserController.create);
routes.put('/users/:id', adminVerify, UserController.update);
routes.post('/users/:id/horarios', UserController.addSpecialOpening);
routes.post('/users/:id/closed', UserController.addSpecialClose);
routes.post('/users/:id/services', UserController.addService);

routes.post('/groups/', UserController.newGroup);
routes.put('/groups/:groupId', UserController.updateGroup);

routes.get('/login', Auth.login);

routes.get('/events', ScheduleController.list);
routes.get('/events/:event', ScheduleController.show);
routes.post('/events', ScheduleController.create);
routes.put('/events/:event', ScheduleController.update);
routes.delete('/events/:event', ScheduleController.delete);

routes.get('/webhooks/freehours', freeHoursHook.getFreeHours);

// didn't work in frontend w/ react, later i will see and solve that.
// routes.get('/webhooks/chatkey', getChat.getId);

routes.use('*', (req, res) =>
  res.status(404).json({ message: 'Rota não encontrada!' })
);

module.exports = routes;
