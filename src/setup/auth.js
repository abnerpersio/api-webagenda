const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = async (req, res, next) => {
  const { username, password, id } = req.headers;

  return await User.findOne({
    username,
    password,
    _id: id,
  })
    .then((authorized) => {
      if (authorized) {
        res.locals.authUser = {
          username: authorized.username,
          id: authorized._id,
        };
        return next();
      } else {
        return res.status(403).end('NAO AUTENTICADO!');
      }
    })
    .catch((error) => {
      return res.status(500).end(error);
    });
};
