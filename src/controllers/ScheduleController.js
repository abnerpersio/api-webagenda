const mongoose = require('mongoose');
const checkBlocking = require('../functions/checkBlocking');

const User = mongoose.model('User');

const errorHandler = require('../functions/errorHandler');
const { notifier } = require('../functions/sender');

const sendDataError = (data, res) => {
  return res.status(400).send(`${data} não encontrado!`);
};

module.exports = {
  async show(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    const { professional } = req.query;
    if (!id) sendDataError('Id do usuário', res);
    if (!event) sendDataError('Evento', res);
    if (!professional) sendDataError('Profissional', res);

    const idEvent = String(event).concat(' ', professional);
    return User.findOne({
      $and: [{ _id: id }, { 'schedule._id': idEvent }],
    })
      .select('schedule')
      .then((user) => {
        if (!user) sendDataError('Evento', res);

        const indexShow = user.schedule.findIndex(
          (eventSchedule) => eventSchedule._id == idEvent
        );
        return res.json(user.schedule[indexShow]);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async list(req, res) {
    const { id } = req.auth;
    if (!id) sendDataError('Id do usuário', res);

    return await User.findById(id)
      .select('schedule')
      .then((user) => res.json(user?.schedule))
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async create(req, res) {
    const { id } = req.auth;
    const { eventhours, service, eventdate } = req.body;
    if (!id) sendDataError('Id do usuário', res);

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
        console.log('responta antes de criar', formattedHours);
        if (formattedHours) {
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
  },

  async update(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    const { eventhours, service } = req.body;
    if (!id) sendDataError('Id do usuário', res);
    if (!event) sendDataError('Evento', res);

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
          const indexUpdate = user.schedule.findIndex(
            (eventSchedule) => eventSchedule._id == event
          );

          if (indexUpdate <= -1) return sendDataError('Evento', res);
          const newEvent = Object.assign(user.schedule[indexUpdate], {
            clientName: req.body?.clientName,
            service: req.body?.service,
            professional: req.body?.professional,
            from: formattedHours[0],
            to: formattedHours[1],
          });

          user.schedule[indexUpdate] = newEvent;
          //
          user
            .save()
            .then((updated) => {
              return res.json(updated.schedule[indexUpdate]);
            })
            .catch((error) => errorHandler.reqErrors(error, res));
        }
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async delete(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    if (!id) sendDataError('Id do usuário', res);

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
        return res.json(updated.schedule);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },
};
