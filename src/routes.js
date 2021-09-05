import './bootstrap';
import express from 'express';

import UserController from './controllers/UserController';
import ScheduleController from './controllers/ScheduleController';
import { webhookGetFreeHours } from './shared/webhooks/freeHours';
import { getId } from './shared/webhooks/getChatId';
import { getService } from './shared/webhooks/services';
import { authMiddleware, login } from './setup/auth';

const routes = express.Router();

const adminVerify = (req, res, next) => {
  if (req.auth.role !== 'admin') {
    return res.status(401).json({
      success: false,
      messsage: 'Not allowed!',
    });
  }

  return next();
};

routes.get('/webhooks/chatid', getId);
routes.get('/webhooks/services', getService);

routes.get('/ping', (req, res) => res.json({ success: true, message: 'pong!' }));

// routes.post('/users', adminVerify, UserController.create);
routes.post('/users', UserController.create);
routes.use(authMiddleware);

routes.get('/users', adminVerify, UserController.findIdByName);

routes.get('/users/:id', UserController.show);
routes.put('/users/:id', UserController.update);
routes.post('/users/:id/special-hours', UserController.addSpecialOpening);
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

routes.get('/webhooks/freehours', webhookGetFreeHours);

routes.use('*', (req, res) => res.status(404).json({ message: 'Rota não encontrada!' }));

export default routes;
