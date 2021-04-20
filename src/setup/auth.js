const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = {
  async authMiddleware(req, res, next) {
    const { username, password } = req.headers;
    return await User.findOne({
      username,
      password,
    })
      .then((authorized) => {
        if (authorized) {
          req.schedule = authorized.schedule;
          req.auth = {
            username: authorized.username,
            id: authorized._id,
          };
          return next();
        } else {
          return res.status(403).json({ message: 'NAO AUTENTICADO!' });
        }
      })
      .catch((error) => res.status(500).send(error));
  },

  async login(req, res) {
    if (req.query?.getschedule)
      return res.json({ ...req.auth, schedule: req.schedule });
    return res.json(req.auth);
  },
};
