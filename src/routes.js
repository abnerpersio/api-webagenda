require('dotenv').config();
const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');
const ScheduleController = require('./controllers/ScheduleController');

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

routes.get('/login', UserController.login);

// routes.get('/events', ScheduleController.list);
// routes.get('/events/:id', ScheduleController.show);
// routes.post('/events', ScheduleController.create);
// routes.put('/events', ScheduleController.update);
// routes.delete('/events', ScheduleController.delete);

routes.use('*', (req, res) =>
  res.status(404).json({ message: 'Rota não encontrada!' })
);

module.exports = routes;
