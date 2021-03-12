require('dotenv').config();
const express = require('express');
const routes = express.Router();

const UserController = require('./controllers/UserController');
const EventController = require('./controllers/EventController');

const adminVerify = (req, res, next) => {
  if (
    req.headers.username == process.env.ADMIN_USER &&
    req.headers.password == process.env.ADMIN_PASS
  ) {
    next();
  } else {
    return res.status(401).end('EI, VOCÊ NÃO ESTÁ AUTORIZADO NESSA ROTA!');
  }
};

routes.get('/ping', (req, res) => res.send('pong!'));

routes.get('/users', adminVerify, UserController.findIdByName);
routes.get('/users/:id', UserController.show);
routes.post('/users', adminVerify, UserController.create);
routes.put('/users/:id', adminVerify, UserController.update);
routes.post('/users/:id/horarios', UserController.addSpecialOpening);

routes.get('/users/login', UserController.login);

routes.get('/events', EventController.list);
routes.get('/events/:id', EventController.show);
routes.post('/events', EventController.create);
routes.put('/events', EventController.update);
routes.delete('/events', EventController.delete);

module.exports = routes;
