const mongoose = require('mongoose');
const {
  checkAndSendResponse,
  checkCustomEventAndSendResponse,
} = require('../functions/checkBlocking');

const User = mongoose.model('User');
const { paginateSchedule, filterDateSchedule } = require('../functions/paginate');
const { format } = require('../functions/formatter');

const errorHandler = require('../functions/errorHandler');
const { notifier } = require('../functions/sender');

const sendDataError = (data, res) => {
  return res.status(400).send(`${data} não encontrado!`);
};

const formatPhoneNumber = (phoneNumber) => {
  const isPhoneNumber = /\(?\d{2,}\)?[ -]?\d{4,}[\-\s]?\d{4}/.test(phoneNumber);

  if (!isPhoneNumber) {
    return null;
  }

  let cleaned = ('' + phoneNumber).replace(/\D/g, '');

  let match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }

  return null;
};

class ScheduleController {
  async show(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    const { professional } = req.query;
    if (!id) return sendDataError('Id do usuário', res);
    if (!event) return sendDataError('Evento', res);
    if (!professional) return sendDataError('Profissional', res);

    const idEvent = String(event).concat(' ', professional);
    return User.findOne({
      $and: [{ _id: id }, { 'schedule._id': idEvent }],
    })
      .select('schedule')
      .then((user) => {
        if (!user) return sendDataError('Evento', res);

        const indexShow = user.schedule.findIndex(
          (eventSchedule) => eventSchedule._id == idEvent
        );
        return res.json(user.schedule[indexShow]);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async list(req, res) {
    const { id } = req.auth;
    const { clientPhone, dateRange } = req.query;

    if (!id) return sendDataError('Id do usuário', res);

    if (clientPhone) {
      const formattedClientPhone = formatPhoneNumber(clientPhone);
      if (!formattedClientPhone) return sendDataError('Telefone inválido', res);

      const listEventsBlipBuilder = (events) => {
        if (events) {
          const blipContent = {
            text:
              events.length > 0
                ? 'Em qual dos seus eventos deseja mexer?'
                : 'Que pena! Não encontrei eventos para esse telefone',
            options: [],
          };
          events.map((event, index) => {
            blipContent.options.push({
              text: `${event.from.split(' ')[0]} às ${
                event.from.split(' ')[1]
              } com ${event.professional}`,
              order: index + 1,
              type: 'text/plain',
              value: event.id,
            });
          });
          return blipContent;
        } else return undefined;
      };

      return await User.findOne({
        $and: [{ _id: id }, { 'schedule.clientPhone': formattedClientPhone }],
      })
        .select('schedule')
        .then((user) => {
          if (!user) return sendDataError('Evento', res);

          const events = user?.schedule.filter(
            (eventSchedule) =>
              eventSchedule.clientPhone === formattedClientPhone
          );

          const blipContent = listEventsBlipBuilder(events);
          return res.json(blipContent);
        })
        .catch((error) => errorHandler.reqErrors(error, res));
    }

    return await User.findById(id)
      .select('schedule')
      .then((user) => {      
        const filteredSchedule = paginateSchedule(user?.schedule, dateRange);
        return res.json(filteredSchedule); 
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async create(req, res) {
    const { id } = req.auth;
    const { eventhours, service, eventdate } = req.body;

    const formattedClientPhone = formatPhoneNumber(req.body.clientPhone);

    if (!id) return sendDataError('Id do usuário', res);
    if (!formattedClientPhone) return sendDataError('Telefone inválido', res);

    const user = await User.findById(id).catch((error) =>
      errorHandler.reqErrors(error, res)
    );

    const formattedDate = format(eventdate);
    const filteredSchedule = filterDateSchedule(user.schedule, formattedDate);

    return await checkAndSendResponse(
      formattedDate,
      eventhours,
      service,
      user.services,
      user.specialOpening,
      user.opening,
      user.closing,
      filteredSchedule
    )
      .then((formattedHours) => {
        if (formattedHours) {
          var idEvent = formattedHours[0].concat(
            ' ',
            String(req.body.professional).toLowerCase()
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
          user
            .save()
            .then((updated) => {
              const indexEvent = user.schedule.findIndex(
                (eventSchedule) => eventSchedule._id == idEvent
              );
              notifier(
                'Um cliente acaba de fazer um agendamento!',
                'confira agora mesmo.',
                user.notificationsToken
              );
              return res.status(201).json(updated.schedule[indexEvent]);
            })
            .catch((error) => errorHandler.reqErrors(error, res));
        }
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async createCustomEvent(req, res) {
    const { id } = req.auth;
    const { eventdate, eventstarthours, eventendhours } = req.body;
    if (!id) return sendDataError('Id do usuário', res);

    const user = await User.findById(id)
      .select('schedule')
      .catch((error) => errorHandler.reqErrors(error, res));

    return await checkCustomEventAndSendResponse(
      eventdate,
      eventstarthours,
      eventendhours,
      user.schedule
    )
      .then((formattedHours) => {
        if (formattedHours) {
          var idEvent = formattedHours[0].concat(
            ' ',
            String(req.body.professional).toLowerCase()
          );
          const newEvent = {
            clientName: 'Fechamento',
            professional: req.body.professional,
            from: formattedHours[0],
            to: formattedHours[1],
          };
          user.schedule.push(newEvent);
          //
          user
            .save()
            .then((updated) => {
              const indexEvent = user.schedule.findIndex(
                (eventSchedule) => eventSchedule._id == idEvent
              );
              notifier(
                'Um cliente acaba de fazer um agendamento!',
                'confira agora mesmo.',
                user.notificationsToken
              );
              return res.status(201).json(updated.schedule[indexEvent]);
            })
            .catch((error) => errorHandler.reqErrors(error, res));
        }
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async delete(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    if (!id) return sendDataError('Id do usuário', res);

    const user = await User.findById(id)
      .select('schedule')
      .catch((error) => errorHandler.reqErrors(error, res));

    const indexDelete = user.schedule.findIndex(
      (eventSchedule) => eventSchedule._id == event
    );

    if (indexDelete <= -1) return sendDataError('Evento', res);
    user.schedule.splice(indexDelete, 1);

    return await user
      .save()
      .then((updated) => {
        return res.sendStatus(204);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async deleteAndCreateNew(req, res) {
    const { id } = req.auth;
    const { oldEventId } = req.params;
    const { eventhours, service, eventdate } = req.body;

    if (!id) return sendDataError('Id do usuário', res);

    const user = await User.findById(id).catch((error) =>
      errorHandler.reqErrors(error, res)
    );

    return await checkBlocking
      .checkAndSendResponse(
        eventdate,
        eventhours,
        service,
        user.services,
        user.specialOpening,
        user.opening,
        user.closing,
        user.schedule
      )
      .then((formattedHours) => {
        if (formattedHours) {
          // deleting old event
          const indexOldEvent = user.schedule.findIndex(
            (eventSchedule) => eventSchedule._id == oldEventId
          );

          if (indexOldEvent > -1) {
            user.schedule.splice(indexOldEvent, 1);
          }
          // creating new event
          var idEvent = formattedHours[0].concat(
            ' ',
            String(req.body.professional).toLowerCase()
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
          user
            .save()
            .then((updated) => {
              const indexEvent = user.schedule.findIndex(
                (eventSchedule) => eventSchedule._id == idEvent
              );
              notifier(
                'Um cliente acaba de fazer um agendamento!',
                'confira agora mesmo.',
                user.notificationsToken
              );
              return res.status(201).json(updated.schedule[indexEvent]);
            })
            .catch((error) => errorHandler.reqErrors(error, res));
        }
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }
}

module.exports = new ScheduleController();
