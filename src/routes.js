require('dotenv').config();
const express = require('express');
const routes = express.Router();

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

routes.get('/webhooks/chatid', getId);
routes.get('/webhooks/services', getService);

routes.use(authMiddleware);

routes.get('/ping', (req, res) => res.send('pong!'));

routes.get('/users', adminVerify, UserController.findIdByName);

routes.get('/users/:id', UserController.show);
routes.post('/users', adminVerify, UserController.create);
routes.put('/users/:id', UserController.update);
routes.post('/users/:id/horarios', UserController.addSpecialOpening);
routes.post('/users/:id/services', UserController.addService);

routes.post('/groups/', UserController.newGroup);
routes.put('/groups/:groupId', UserController.updateGroup);

routes.get('/login', login);

routes.get('/events', ScheduleController.list);
routes.get('/events/:event', ScheduleController.show);
routes.post('/events', ScheduleController.create);
routes.put('/events/:event', ScheduleController.deleteAndCreateNew);
routes.delete('/events/:event', ScheduleController.delete);
routes.post('/custom/events', ScheduleController.createCustomEvent);

routes.get('/webhooks/freehours', getFreeHours);

routes.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('Provocando um erro no Sentry!');
});

routes.use('*', (req, res) =>
  res.status(404).json({ message: 'Rota não encontrada!' })
);

module.exports = routes;
