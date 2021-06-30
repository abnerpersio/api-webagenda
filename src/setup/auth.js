const mongoose = require('mongoose');
const User = mongoose.model('User');
const { getToken, verifyToken } = require('./jwt');
const { verifyPassword } = require('./crypto');

module.exports = {
  async authMiddleware(req, res, next) {
    // auth with token
    if (req.headers.authorization) {
      const { username, authorization } = req.headers;
      const [, token] = authorization.split(' ');

      try {
        const decodedData = verifyToken(token);

        if(decodedData.username !== username) {
          return res.status(401).json({ message: 'NAO AUTENTICADO!' });
        }

        return await User.findById(decodedData.id)
          .then((authorized) => {
            if (authorized) {
              
              req.data = {
                schedule: authorized.schedule,
                services: authorized.services,
                professional: authorized.professional,
              };

              req.auth = {
                username: authorized.username,
                id: authorized._id,
              };

              return next();
            } else {
              return res.status(401).json({ message: 'NAO AUTENTICADO!' });
            }
          })
          .catch((error) => res.status(500).send(error));

      } catch (err) {
        if (err.message === 'jwt expired') {
          return res.status(401).send('NAO AUTENTICADO!');
        }
        
        res.sendStatus(500);
      }
    }
    // auth with no token
    const { username, password } = req.headers;

    return await User.findOne({
      username,
    })
      .then(async (user) => {
        const authorized = await verifyPassword(password, user.password);

        if (authorized) {
          req.token = getToken({
            id: user._id,
            username: user.username
          });

          req.auth = {
            username: user.username,
            id: user._id,
          };

          return next();
        } else {
          return res.status(403).json({ message: 'NAO AUTENTICADO!' });
        }
      })
      .catch((error) => res.status(500).send(error));
  },

  async login(req, res) {
    if (req.query?.getdata) {
      return res.json({
        ...req.auth,
        ...req.data
      });
    }

    return res.json({
      ...req.auth,
      token: req.token,
    });
  },
};
