import mongoose from 'mongoose';

const Group = mongoose.model('Group');

export const getId = async (req, res) => {
  const { group } = req.query;
  if (!group) {
    req.errorCode = 400;
    throw new Error('por favor digite um grupo válido');
  }

  const user = await Group.findOne({ name: group });

  if (user) {
    return res.json(user?.chatId);
  }

  req.errorCode = 400;
  throw new Error('usuario sem chat ainda');
};
