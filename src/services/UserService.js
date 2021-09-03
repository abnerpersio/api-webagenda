import mongoose from 'mongoose';

const User = mongoose.model('User');

class UserService {
  async create(user) {
    const createdUser = await User.create(user);
    return createdUser;
  }
}

export default new UserService();
