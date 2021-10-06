import mongoose from 'mongoose';
import {
  checkAndSendResponse,
  checkCustomEventAndSendResponse,
} from '../shared/utils/checkBlocking';
import { paginateSchedule, filterDateSchedule } from '../shared/utils/paginate';
import { format } from '../shared/utils/formatter';
import { firebaseNotifier } from '../shared/utils/notifier';

const User = mongoose.model('User');

const sendDataError = (data, res) => res.status(400).send(`${data} não encontrado!`);

const formatPhoneNumber = (phoneNumber) => {
  const isPhoneNumber = /\(?\d{2,}\)?[ -]?\d{4,}[\-\s]?\d{4}/.test(phoneNumber);

  if (!isPhoneNumber) {
    return null;
  }

  return phoneNumber.replace(/\D/g, '')
    .replace(/^(\d{2})\B/, '($1) ')
    .replace(/(\d{1})?(\d{4})(\d{4})/, '$1$2-$3');
};

class ScheduleController {
  async show(req, res) {
    const { id } = req.auth;
    const { event: eventId } = req.params;
    const { professional } = req.query;
    if (!professional) return sendDataError('Profissional', res);

    const user = await User.findOne({
      $and: [{ _id: id }, { 'schedule._id': eventId }],
    })
      .select('schedule');

    if (!user) return sendDataError('Evento', res);

    const indexShow = user.schedule.findIndex(
      (eventSchedule) => eventSchedule._id === eventId,
    );
    return res.json(user.schedule[indexShow]);
  }

  async list(req, res) {
    const { id } = req.auth;
    const { clientPhone, dateRange } = req.query;

    if (clientPhone) {
      const formattedClientPhone = formatPhoneNumber(clientPhone);

      if (!formattedClientPhone) {
        sendDataError('Telefone inválido', res);
        return;
      }

      const listEventsBlipBuilder = (events) => {
        if (events) {
          const blipContent = {
            text:
              events.length > 0
                ? 'Em qual dos seus eventos deseja mexer?'
                : 'Que pena! Não encontrei eventos para esse telefone',
            options: [],
          };

          events.map((event, index) => blipContent.options.push({
            text: `${event.from.split(' ')[0]} às ${
              event.from.split(' ')[1]
            } com ${event.professional}`,
            order: index + 1,
            type: 'text/plain',
            value: event.id,
          }));

          return blipContent;
        } return undefined;
      };

      const user = await User.findOne({
        $and: [{ _id: id }, { 'schedule.clientPhone': formattedClientPhone }],
      })
        .select('schedule');

      if (!user) throw new Error('evento não pode ser vazio');

      const events = user?.schedule.filter(
        (eventSchedule) => eventSchedule.clientPhone === formattedClientPhone,
      );

      const blipContent = listEventsBlipBuilder(events);
      res.json(blipContent);
      return;
    }

    const user = await User.findById(id).select('schedule');

    const filteredSchedule = paginateSchedule(user?.schedule, dateRange);
    res.json(filteredSchedule);
  }

  async create(req, res) {
    const { id } = req.auth;
    const { eventhours, service, eventdate } = req.body;

    const formattedClientPhone = formatPhoneNumber(req.body.clientPhone);

    // if (!formattedClientPhone) {
    //   sendDataError('Telefone inválido', res);
    //   return;
    // }

    const user = await User.findById(id);

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

    if (formattedHours) {
      const idEvent = formattedHours[0].concat(
        ' ',
        String(req.body.professional).toLowerCase(),
      );
      const newEvent = {
        clientName: req.body.clientName,
        clientPhone: formattedClientPhone,
        service: req.body.service,
        professional: req.body.professional,
        from: formattedHours[0],
        to: formattedHours[1],
      };

      user.schedule.push(newEvent);
      //
      const updated = await user
        .save();

      const indexEvent = user.schedule.findIndex(
        (eventSchedule) => eventSchedule._id === idEvent,
      );

      firebaseNotifier({
        title: 'Um cliente acaba de fazer um agendamento!',
        message: 'confira agora mesmo.',
        notificationToken: user.notificationsToken,
      });

      res.status(201).json(updated.schedule[indexEvent]);
    }
  }

  async createCustomEvent(req, res) {
    const { id } = req.auth;
    const { eventdate, eventstarthours, eventendhours } = req.body;

    if (!id) {
      sendDataError('Id do usuário', res);
      return;
    }

    const user = await User.findById(id).select('schedule');

    const formattedDate = format(eventdate);
    const filteredSchedule = filterDateSchedule(user.schedule, formattedDate);

    const formattedHours = await checkCustomEventAndSendResponse(
      eventdate,
      eventstarthours,
      eventendhours,
      filteredSchedule,
    );

    if (formattedHours) {
      const idEvent = formattedHours[0].concat(
        ' ',
        String(req.body.professional).toLowerCase(),
      );

      const newEvent = {
        clientName: 'Fechamento',
        professional: req.body.professional,
        from: formattedHours[0],
        to: formattedHours[1],
      };

      user.schedule.push(newEvent);
      //
      const updated = await user.save();

      const indexEvent = user.schedule.findIndex(
        (eventSchedule) => eventSchedule._id === idEvent,
      );

      firebaseNotifier({
        title: 'Um cliente acaba de fazer um agendamento!',
        message: 'confira agora mesmo.',
        notificationToken: user.notificationsToken,
      });

      res.status(201).json(updated.schedule[indexEvent]);
    }
  }

  async delete(req, res) {
    const { id } = req.auth;
    const { event } = req.params;

    const user = await User.findById(id).select('schedule');

    const indexDelete = user.schedule.findIndex(
      (eventSchedule) => eventSchedule._id === event,
    );

    if (indexDelete <= -1) {
      sendDataError('Evento', res);
      return;
    }

    user.schedule.splice(indexDelete, 1);

    await user.save();
    res.sendStatus(204);
  }

  async deleteAndCreateNew(req, res) {
    const { id } = req.auth;
    const { oldEventId } = req.params;
    const { eventhours, service, eventdate } = req.body;

    const user = await User.findById(id);

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

    if (formattedHours) {
      // deleting old event
      const indexOldEvent = user.schedule.findIndex(
        (eventSchedule) => eventSchedule._id === oldEventId,
      );

      if (indexOldEvent > -1) {
        user.schedule.splice(indexOldEvent, 1);
      }
      // creating new event
      const idEvent = formattedHours[0].concat(
        ' ',
        String(req.body.professional).toLowerCase(),
      );
      const newEvent = {
        clientName: req.body.clientName,
        service: req.body.service,
        professional: req.body.professional,
        from: formattedHours[0],
        to: formattedHours[1],
      };
      user.schedule.push(newEvent);
      //
      const updated = await user.save();

      const indexEvent = user.schedule.findIndex(
        (eventSchedule) => eventSchedule._id === idEvent,
      );

      firebaseNotifier({
        title: 'Um cliente acaba de fazer um agendamento!',
        message: 'confira agora mesmo.',
        notificationToken: user.notificationsToken,
      });

      res.status(201).json(updated.schedule[indexEvent]);
    }
  }
}

export default new ScheduleController();
