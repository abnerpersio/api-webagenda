const mongoose = require('mongoose');
const User = mongoose.model('User');

const errorHandler = require('../functions/errorHandler');

module.exports = {
  async getService(req, res) {
    const { username } = req.query;
    if (!username) res.status(400).json('por favor digite um usuário');

    await User.find({ groupName: username })
      .select('services')
      .then((users) => {
        let allServices = [];

        users.forEach((user) => {
          user?.services?.forEach((service) => {
            const { serviceName, serviceTime } = service;
            allServices.push({ serviceName, serviceTime });
          });
        });

        return res.json(allServices);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },
};
