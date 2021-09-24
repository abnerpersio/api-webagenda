import mongoose from 'mongoose';

const User = mongoose.model('User');

export const getUser = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    req.errorCode = 400;
    throw new Error('por favor digite um usuario válido');
  }

  const user = await User.findOne({ username });

  if (!user) {
    req.errorCode = 400;
    throw new Error('usuario não encontrado');
  }

  return res.json({
    _id: user._id,
    username,
  });
};
