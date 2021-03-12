const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = {
  async show(req, res) {
    return await User.findById(req.params.id)
      .then((user) => {
        return res.json(user);
      })
      .catch((error) => res.status(500).send(error));
  },

  async create(req, res) {
    return await User.create(req.body)
      .then((user) => {
        return res.json(user);
      })
      .catch((error) => res.status(500).send(error));
  },

  async update(req, res) {
    return await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .then((user) => {
        return res.json(user);
      })
      .catch((error) => res.status(500).send(error));
  },

  async remove(req, res) {
    return res.send('teste');
  },

  async findIdByName(req, res) {
    return await User.findOne({ username: req.query.username })
      .then((user) => {
        return res.json({ id: user.id });
      })
      .catch((error) => res.status(500).send(error));
  },

  async addSpecialOpening(req, res) {
    return User.findById(req.params.id).then((user) => {
      const specialOpening = user.specialOpening;
      const newSpecialOpening = req.body;
      specialOpening.push(newSpecialOpening);

      return User.findByIdAndUpdate(
        req.params.id,
        { specialOpening: specialOpening },
        { new: true }
      )
        .then((user) => {
          return res.send(user.specialOpening);
        })
        .catch((error) => res.status(500).send(error));
    });
  },

  async login(req, res) {
    return res.json(res.locals.authUser);
  },
};
