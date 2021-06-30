const jwt = require('jsonwebtoken');

function getToken(getUser) {
  const newToken = jwt.sign(
    {
      data: getUser,
    },
    'secret',
    { expiresIn: 60 * 60 * 24 * 7 }
  );

  return newToken;
}

function verifyToken() {
  const decoded = jwt.verify(token, 'secret');
  return decoded.data;
}

module.exports = {
  getToken,
  verifyToken
}