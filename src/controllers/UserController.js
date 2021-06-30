const mongoose = require('mongoose');
const User = mongoose.model('User');
const Group = mongoose.model('Group');

const errorHandler = require('../functions/errorHandler');
const { format } = require('../functions/formatter');
const { hash } = require('../setup/crypto');

class UserController {
  async show(req, res) {
    const { prop } = req.query;

    return await User.findById(req.params.id)
      .then((resultUser) => { 
        const { schedule, password, ...user } = resultUser.toJSON();
        res.json(user?.[prop] ? user?.[prop] : user) 
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async create(req, res) {
    const hashedPassword = await hash(req.body.password);

    return await User.create({ ...req.body, password: hashedPassword })
      .then((resultUser) => {
        const { password, ...user } = resultUser.toJSON();
        res.status(201).json(user);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async update(req, res) {
    const { password, groupName } = req.body;
    
    if (groupName) {
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        return res.status(400).json({ message: 'este grupo não existe' });
      }
    }

    if (password) {
      const hashedPassword = await hash(password);
      return await User.findByIdAndUpdate(req.params.id, { ...req.body, password: hashedPassword }, {
        new: true,
        runValidators: true,
      })
        .then((user) => {
          const {
            specialOpening,
            schedule,
            services,
            password,
            ...userUpdated
          } = user.toObject();
          res.json(userUpdated);
        })
        .catch((error) => errorHandler.reqErrors(error, res));
    }

    return await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .then((user) => {
        const { specialOpening, schedule, services, password, ...userUpdated } = user.toObject();
        res.json(userUpdated);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async findIdByName(req, res) {
    // admin route
    return await User.findOne({ username: req.query.username })
      .then((user) => res.json({ id: user.id }))
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async addSpecialOpening(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('specialOpening');

    const { eventdate, from, to } = req.body;

    const formattedDate = format(eventdate);
    const fullStartDate = formattedDate?.split(' ')[0]?.concat(' ', from);
    const fullEndDate = formattedDate?.split(' ')[0]?.concat(' ', to);

    user.specialOpening.push({ from: fullStartDate, to: fullEndDate });

    return await user
      .save()
      .then((updated) => {
        var index = updated?.specialOpening?.findIndex(
          (item) => item?.from === fullStartDate && item?.to === fullEndDate
        );
        return res.json(updated.specialOpening[index]);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async addService(req, res) {
    const { id } = req.params;
    const user = await User.findById(id).select('services');

    const { newServices } = req.body;
    newServices?.forEach((item) => {
      user.services.push(item);
    });

    return await user
      .save()
      .then((updated) => {
        return res.json(updated.services);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async newGroup(req, res) {
    await Group.create(req.body)
      .then((group) => {
        res.json(group);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }

  async updateGroup(req, res) {
    const { groupId } = req.params;
    if (!groupId) return res.status(400).status('digite um id do grupo');

    await Group.findByIdAndUpdate(groupId, req.body, { new: true })
      .then((updated) => {
        res.json(updated);
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  }
}

module.exports = new UserController();
