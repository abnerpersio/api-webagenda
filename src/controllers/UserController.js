const mongoose = require('mongoose');
const User = mongoose.model('User');
const errorHandler = require('./errorHandler');
const validateFields = async (...fields) => {
  if (!fields) {
    return new error('ei, um campo está inválido!');
  }
};

module.exports = {
  async show(req, res) {
    return await User.findById(req.params.id)
      .then((user) => {
        return res.json(user);
      })
      .catch((error) => errorHandler(error, res));
  },

  async create(req, res) {
    return await User.create(req.body)
      .then((user) => {
        return res.status(201).json(user);
      })
      .catch((error) => errorHandler(error, res));
  },

  async update(req, res) {
    return await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .then((user) => {
        return res.json(user);
      })
      .catch((error) => errorHandler(error, res));
  },

  async remove(req, res) {
    return res.send('teste');
  },

  async findIdByName(req, res) {
    return await User.findOne({ username: req.query.username })
      .then((user) => {
        return res.json({ id: user.id });
      })
      .catch((error) => errorHandler(error, res));
  },

  async addSpecialOpening(req, res) {
    return User.findById(req.params.id)
      .select('specialOpening')
      .then((response) => {
        const specialOpening = response;
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
          .catch((error) => errorHandler(error, res));
      })
      .catch((error) => errorHandler(error, res));
  },

  async login(req, res) {
    return res.json(res.locals.authUser);
  },
};
