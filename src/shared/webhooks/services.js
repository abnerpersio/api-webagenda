import mongoose from 'mongoose';

const User = mongoose.model('User');

export const getService = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    req.errorCode = 400;
    throw new Error('por favor digite um nome de usuário');
  }

  const users = await User.find({ username })
    .select('services');

  let allServices = [];

  users.forEach((user) => {
    allServices = user?.services?.map((service) => ({
      serviceName: service.serviceName,
      serviceTime: service.serviceTime,
    }));
  });

  return res.json(allServices);
};
