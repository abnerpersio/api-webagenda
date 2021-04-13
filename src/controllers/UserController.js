const mongoose = require('mongoose');
const User = mongoose.model('User');
const Group = mongoose.model('Group');

const errorHandler = require('../functions/errorHandler');

module.exports = {
  async show(req, res) {
    const prop = req.query.prop;

    return await User.findById(req.params.id)
      .then((user) => res.json(user?.[prop] ? user?.[prop] : user))
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async create(req, res) {
    return await User.create(req.body)
      .then((user) => res.status(201).json(user))
      .catch((error) => errorHandler.reqErrors(error, res));
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
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async findIdByName(req, res) {
    return await User.findOne({ username: req.query.username })
      .then((user) => res.json({ id: user.id }))
      .catch((error) => errorHandler.reqErrors(error, res));
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
      .catch((error) => errorHandler.reqErrors(error, res));
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
      .catch((error) => errorHandler.reqErrors(error, res));
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
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async newGroup(req, res) {
    await Group.create(req.body)
      .then((group) => {
        res.json(group);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },

  async updateGroup(req, res) {
    const { groupId } = req.params;
    if (!groupId) return res.status(400).status('digite um id do grupo');

    await Group.findByIdAndUpdate(groupId, req.body, { new: true })
      .then((updated) => {
        res.json(updated);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },
};
