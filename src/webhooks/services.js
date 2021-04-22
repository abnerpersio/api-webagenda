const mongoose = require('mongoose');
const User = mongoose.model('User');

const errorHandler = require('../functions/errorHandler');

module.exports = {
  async getService(req, res) {
    const { username } = req.query;
    if (!username) res.status(400).json('por favor digite um usuário');

    await User.findOne({ username: username })
      .then((user) => {
        res.json(user?.services);
      })
      .catch((error) => errorHandler(error, res));
  },
};
