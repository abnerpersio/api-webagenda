const mongoose = require('mongoose');
const Group = mongoose.model('Group');

const errorHandler = require('../functions/errorHandler');

module.exports = {
  async getService(req, res) {
    const { username } = req.query;
    if (!username) res.status(400).json('por favor digite um usuário');

    await Group.findOne({ name: username })
      .then((group) => {
        res.json(group?.services);
      })
      .catch((error) => errorHandler(error, res));
  },
};
