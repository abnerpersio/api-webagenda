import mongoose from 'mongoose';

const User = mongoose.model('User');

class ScheduleService {
  async getAllEvents(userId) {
    const user = await User.findOne(
      { _id: userId },
    ).select('schedule');

    return user.schedule;
  }

  async getEventById(userId, eventId) {
    const user = await User.findOne({
      $and: [{ _id: userId }, { 'schedule._id': eventId }],
    }).select('schedule');

    return user.schedule.find(
      (item) => item._id === eventId,
    );
  }

  async getEventsByClientPhone(userId, clientPhone) {
    const user = await User.findOne({
      $and: [{ _id: userId }, { 'schedule.clientPhone': clientPhone }],
    }).select('schedule');

    return user.schedule.filter(
      (item) => item.clientPhone === clientPhone,
    );
  }

  async create(userId, event) {
    const user = await User.findOne(
      { _id: userId },
    ).select('schedule');

    const newEvent = event;

    user.schedule.push(newEvent);
    return user.save();
  }

  async update(userId, eventId, updateEvent) {
    const user = await User.findOne(
      { _id: userId },
    ).select('schedule');

    const eventIndex = user.schedule.findIndex((item) => item.uuid === eventId);

    if (eventIndex < 0) {
      throw new Error('event not found');
    }

    user.schedule[eventIndex] = {
      ...user.schedule[eventIndex],
      ...updateEvent,
    };

    return user.save();
  }

  async delete(userId, eventId) {
    const user = await User.findOne(
      { _id: userId },
    ).select('schedule');

    const eventIndex = user.schedule.findIndex((item) => item.uuid === eventId);

    if (eventIndex < 0) {
      throw new Error('event not found');
    }

    user.schedule.splice(eventIndex, 1);

    return user.save();
  }
}

export default new ScheduleService();
