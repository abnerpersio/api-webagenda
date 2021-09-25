import mongoose from 'mongoose';
import {
  checkAndSendResponse,
} from '../shared/utils/checkBlocking';
import { filterDateSchedule } from '../shared/utils/paginate';
import { format } from '../shared/utils/formatter';
import { firebaseNotifier } from '../shared/utils/notifier';
import ScheduleService from '../services/ScheduleService';
import { listEventsBlipBuilder } from '../shared/utils/chatContent';
import { freeHoursBlipFormat } from '../shared/utils/freeHoursCalculate';

const User = mongoose.model('User');

class ChatController {
  async show(req, res) {
    const userId = req.headers['x-wa-user-id'];
    const { id: eventId } = req.params;

    const event = await ScheduleService.getEventById(userId, eventId);

    if (!event) {
      req.errorCode = 400;
      throw new Error('Erro ao encontrar evento');
    }

    return res.json(event);
  }

  async list(req, res) {
    const userId = req.headers['x-wa-user-id'];
    const { clientPhone } = req.query;

    if (!clientPhone) {
      req.errorCode = 400;
      throw new Error('Telefone vazio');
    }

    const formattedClientPhone = clientPhone.replace(/\D/, '');

    const events = await ScheduleService.getEventsByClientPhone(
      userId, formattedClientPhone,
    );

    res.json(listEventsBlipBuilder(events));
  }

  async create(req, res) {
    const userId = req.headers['x-wa-user-id'];
    const { eventhours, service, eventdate } = req.body;

    const formattedClientPhone = req.body.clientPhone?.replace(/\D/, '');

    const user = await User.findOne({ _id: userId });

    const formattedDate = format(eventdate);
    const filteredSchedule = filterDateSchedule(user.schedule, formattedDate);

    const formattedHours = await checkAndSendResponse(
      eventdate,
      eventhours,
      service,
      user.services,
      user.specialOpening,
      user.opening,
      user.closing,
      filteredSchedule,
    );

    if (!formattedHours) {
      req.errorCode = 400;
      throw new Error('Erro ao formatar seu evento');
    }

    await ScheduleService.create(userId, {
      clientName: req.body.clientName,
      clientPhone: formattedClientPhone,
      service: req.body.service,
      professional: req.body.professional,
      from: formattedHours[0],
      to: formattedHours[1],
    });

    firebaseNotifier({
      title: 'Um cliente acaba de fazer um agendamento',
      message: 'confira agora mesmo.',
      notificationToken: user.notificationsToken,
    });

    res.sendStatus(201);
  }

  async delete(req, res) {
    const userId = req.headers['x-wa-user-id'];
    const { id: eventId } = req.params;

    await ScheduleService.delete(userId, eventId);

    res.sendStatus(204);
  }

  async update(req, res) {
    const userId = req.headers['x-wa-user-id'];
    const { id: eventId } = req.params;
    const { eventhours, service, eventdate } = req.body;

    const user = await User.findOne({ _id: userId });

    const formattedHours = await checkAndSendResponse(
      eventdate,
      eventhours,
      service,
      user.services,
      user.specialOpening,
      user.opening,
      user.closing,
      user.schedule,
    );

    if (!formattedHours) {
      req.errorCode = 400;
      throw new Error('Erro ao formatar seu evento');
    }

    await ScheduleService.update(
      userId,
      eventId,
      {
        clientName: req.body.clientName,
        service: req.body.service,
        professional: req.body.professional,
      },
    );

    firebaseNotifier({
      title: 'Um cliente acaba de fazer um agendamento!',
      message: 'confira agora mesmo.',
      notificationToken: user.notificationsToken,
    });

    res.sendStatus(200);
  }

  async freeTimes(req, res) {
    const userId = req.headers['x-wa-user-id'];
    const { eventdate, serviceoption } = req.headers;

    if (!eventdate) {
      req.errorCode = 400;
      throw new Error('Data faltando');
    }

    const blipContent = await freeHoursBlipFormat({
      userId,
      eventdate,
      serviceoption,
    });

    return res.json(blipContent);
  }
}

export default new ChatController();
