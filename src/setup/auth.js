const mongoose = require('mongoose');
const User = mongoose.model('User');
const { encrypt, decrypt } = require('./crypto');

module.exports = {
  async authMiddleware(req, res, next) {
    // auth with token
    if (req.headers.token && req.headers.iv && req.headers.username) {
      const { iv, token, username } = req.headers;

      let decrypted = decrypt({
        iv: iv,
        content: token,
      });
      //
      if (decrypted.split(' ')[1] !== username) {
        return res.status(403).json({ message: 'NAO AUTENTICADO!' });
      }
      //
      return await User.findById(decrypted.split(' ')[0])
        .then((authorized) => {
          if (authorized) {
            req.schedule = authorized.schedule;
            req.services = authorized.services;
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
    }
    // auth with no token
    const { username, password } = req.headers;

    return await User.findOne({
      username,
      password,
    })
      .then((authorized) => {
        if (authorized) {
          req.token = encrypt(
            String(authorized._id).concat(' ', authorized.username)
          );
          req.schedule = authorized.schedule;
          req.services = authorized.services;
          req.professional = authorized.professional;
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
    if (req.query?.token) {
      return res.json({
        ...req.auth,
        token: req.token,
      });
    }
    if (req.query?.getdata) {
      return res.json({
        ...req.auth,
        schedule: req.schedule,
        services: req.services,
        professional: req.professional,
      });
    }
    return res.json(req.auth);
  },
};
