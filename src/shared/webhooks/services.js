import mongoose from 'mongoose';

const User = mongoose.model('User');

export const getService = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    req.errorCode = 400;
    throw new Error('por favor digite um nome de usuário');
  }

  const users = await User.find({ groupName: username })
    .select('services');
  const allServices = [];

  users.forEach((user) => {
    user?.services?.forEach((service) => {
      const { serviceName, serviceTime } = service;
      allServices.push({ serviceName, serviceTime });
    });
  });

  return res.json(allServices);
};
