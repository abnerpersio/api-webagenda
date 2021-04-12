const mongoose = require('mongoose');
const Group = mongoose.model('Group');

const errorHandler = require('../functions/errorHandler');

module.exports = {
  async getId(req, res) {
    const { group } = req.query;
    if (!group) res.status(400).json('por favor digite um usuário');

    await Group.findOne({ name: group })
      .then((user) => {
        console.log('user', user);
        res.json(user?.chatId || 'usuario sem chat ainda');
      })
      .catch((error) => errorHandler(error, res));
  },
};
