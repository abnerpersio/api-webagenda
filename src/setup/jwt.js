import jwt from 'jsonwebtoken';

export const getToken = (getUser) => {
  const newToken = jwt.sign(
    {
      data: getUser,
    },
    process.env.NODE_AUTH_TOKEN_JWT,
    { expiresIn: 60 * 60 * 24 * 7 },
  );

  return newToken;
};

export const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.NODE_AUTH_TOKEN_JWT);
  return decoded.data;
};
