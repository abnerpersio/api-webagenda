import mongoose from 'mongoose';
import { format } from '../shared/utils/formatter';
import UserService from '../services/UserService';

const User = mongoose.model('User');
const Group = mongoose.model('Group');

class UserController {
  async show(req, res) {
    const { prop } = req.query;

    const resultUser = await User.findById(req.auth.id);

    if (!resultUser) {
      res.sendStatus(404);
      return;
    }

    const { schedule, password, ...user } = resultUser.toObject();
    res.json(user?.[prop] ? user?.[prop] : user);
  }

  async findIdByName(req, res) {
    const user = await User.findOne({ username: req.query.username });

    res.json({ id: user.id });
  }

  async create(req, res) {
    const userExists = await User.findOne({ username: req.body.username });

    if (userExists) {
      req.errorCode = 400;
      throw new Error('User already exists');
    }

    const user = await UserService.create(req.body);

    res.status(201).json(user);
  }

  async update(req, res) {
    const { groupName } = req.body;

    if (groupName) {
      const group = await Group.findOne({ name: groupName });

      if (!group) {
        req.errorCode = 400;
        throw new Error('este grupo não existe');
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const {
      specialOpening, schedule, services, ...userUpdated
    } = user.toObject();

    res.json(userUpdated);
  }

  async addSpecialOpening(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('specialOpening');

    const { eventdate, from, to } = req.body;

    const formattedDate = format(eventdate);
    const fullStartDate = formattedDate?.split(' ')[0]?.concat(' ', from);
    const fullEndDate = formattedDate?.split(' ')[0]?.concat(' ', to);

    user.specialOpening.push({ from: fullStartDate, to: fullEndDate });

    const updated = await user.save();

    const index = updated?.specialOpening?.findIndex(
      (item) => item?.from === fullStartDate && item?.to === fullEndDate,
    );
    return res.json(updated.specialOpening[index]);
  }

  async addService(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('services');

    const { newServices } = req.body;
    newServices?.forEach((item) => {
      user.services.push(item);
    });

    const updated = await user.save();
    res.json(updated.services);
  }

  async newGroup(req, res) {
    const group = await Group.create(req.body);
    res.json(group);
  }

  async updateGroup(req, res) {
    const { groupId } = req.params;

    if (!groupId) {
      req.errorCode = 400;
      throw new Error('digite um id do grupo');
    }

    const updated = await Group.findByIdAndUpdate(groupId, req.body, { new: true });
    res.json(updated);
  }
}

export default new UserController();
