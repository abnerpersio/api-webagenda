const mongoose = require('mongoose');
const Schedule = mongoose.model('Schedule');

module.exports = {
  async show(req, res) {
    const { id, event } = req.query;
    return await Schedule.findById(id)
      .then((user) => {
        return res.json(user.event);
      })
      .catch((error) => {
        return res.status(500).send(error);
      });
  },

  async list(req, res) {
    const { id } = req.query;
    if (!id) res.status(400).send('Id do usuário não identificiado');

    return await Schedule.find(req.query.id)
      .then((response) => res.json(response))
      .catch((error) => res.status(500).send(error));
  },

  async create(req, res) {
    return await Schedule.create(req.body)
      .then((evento) => {
        return res.send(evento);
      })
      .catch((error) => res.status(500).send(error));
  },

  async update(req, res) {},

  async delete(req, res) {},
};
