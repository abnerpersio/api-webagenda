const mongoose = require('mongoose');
const User = mongoose.model('User');

const errorHandler = require('../functions/errorHandler');
const validateFields = async (...fields) => {
  if (!fields) {
    return new error('ei, um campo está inválido!');
  }
};

module.exports = {
  async show(req, res) {
    const prop = req.query.prop;

    return await User.findById(req.params.id)
      .then((user) => res.json(user?.[prop] ? user?.[prop] : user))
      .catch((error) => errorHandler(error, res));
  },

  async create(req, res) {
    return await User.create(req.body)
      .then((user) => res.status(201).json(user))
      .catch((error) => errorHandler(error, res));
  },

  async update(req, res) {
    return await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .then((user) => {
        const {
          specialOpening,
          schedule,
          services,
          ...userUpdated
        } = user.toObject();
        res.json(userUpdated);
      })
      .catch((error) => errorHandler(error, res));
  },

  async findIdByName(req, res) {
    return await User.findOne({ username: req.query.username })
      .then((user) => res.json({ id: user.id }))
      .catch((error) => errorHandler(error, res));
  },

  async addSpecialOpening(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('specialOpening');
    user.specialOpening.push(req.body);

    return await user
      .save()
      .then((updated) => {
        return res.json(updated.specialOpening);
      })
      .catch((error) => errorHandler(error, res));
  },

  async addSpecialClose(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('specialOpening');
    user.specialOpening.push(req.body);

    return await user
      .save()
      .then((updated) => {
        return res.json(updated.specialOpening);
      })
      .catch((error) => errorHandler(error, res));
  },

  async addService(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('services');
    user.services.push(req.body);

    return await user
      .save()
      .then((updated) => {
        return res.json(updated.services);
      })
      .catch((error) => errorHandler(error, res));
  },
};
