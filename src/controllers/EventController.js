const mongoose = require('mongoose');
const Event = mongoose.model('Event');

module.exports = {
  async show(req, res) {
    return await Event.findById(req.params.id)
      .then((user) => {
        return res.json(user);
      })
      .catch((error) => {
        return res.status(500).send(error);
      });
  },

  async list(req, res) {
    return await Event.find();
  },

  async create(req, res) {},

  async update(req, res) {},

  async delete(req, res) {},
};
