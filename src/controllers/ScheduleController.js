const mongoose = require('mongoose');
const User = mongoose.model('User');

const errorHandler = require('../functions/errorHandler');
const validateFields = async (...fields) => {
  if (!fields) {
    return new error('ei, um campo está inválido!');
  }
};

const sendDataError = (data, res) => {
  return res.status(400).send(`${data} não encontrado!`);
};

module.exports = {
  async show(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    if (!id) sendDataError('Id do usuário', res);
    if (!event) sendDataError('Evento', res);

    return User.findOne({
      $and: [{ _id: id }, { 'schedule._id': event }],
    })
      .select('schedule')
      .then((user) => {
        if (!user) sendDataError('Evento', res);

        const indexShow = user.schedule.findIndex(
          (eventSchedule) => eventSchedule._id == event
        );
        return res.json(user.schedule[indexShow]);
      })
      .catch((error) => errorHandler(error, res));
  },

  async list(req, res) {
    const { id } = req.auth;
    if (!id) sendDataError('Id do usuário', res);

    return await User.findById(id)
      .select('schedule')
      .then((user) => res.json(user?.schedule))
      .catch((error) => errorHandler(error, res));
  },

  async create(req, res) {
    const { id } = req.auth;
    if (!id) sendDataError('Id do usuário', res);

    const user = await User.findById(id)
      .select('schedule')
      .catch((error) => errorHandler(error, res));

    user.schedule.push(req.body);

    return await user
      .save()
      .then((updated) => {
        return res.json(updated.schedule);
      })
      .catch((error) => errorHandler(error, res));
  },

  async update(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    if (!id) sendDataError('Id do usuário', res);
    if (!event) sendDataError('Evento', res);

    const user = await User.findById(id)
      .select('schedule')
      .catch((error) => errorHandler(error, res));

    const indexUpdate = user.schedule.findIndex(
      (eventSchedule) => eventSchedule._id == event
    );

    if (indexUpdate <= -1) return sendDataError('Evento', res);
    const newEvent = Object.assign(user.schedule[indexUpdate], req.body);
    user.schedule[indexUpdate] = newEvent;

    return await user
      .save()
      .then((updated) => {
        return res.json(updated.schedule);
      })
      .catch((error) => errorHandler(error, res));
  },

  async delete(req, res) {
    const { id } = req.auth;
    const { event } = req.params;
    if (!id) sendDataError('Id do usuário', res);

    const user = await User.findById(id)
      .select('schedule')
      .catch((error) => errorHandler(error, res));

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
      .catch((error) => errorHandler(error, res));
  },
};
