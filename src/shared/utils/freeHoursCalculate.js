import mongoose from 'mongoose';

import { format } from './formatter';
import { filterDateSchedule } from './paginate';
import { calculateFreeTimes, formatHours, returnFreeTimes } from './checkers';

const User = mongoose.model('User');

export const freeHoursJsonFormat = async ({ userId: id, eventdate }) => {
  const user = await User.findById(id);

  const formattedEventDate = format(eventdate);

  const {
    specialOpening, opening, closing, schedule,
  } = user;

  const filteredSchedule = filterDateSchedule(schedule, formattedEventDate);

  const {
    specialOpeningArray,
    openTime,
    workingInfo,
    closedTime,
    scheduleArray,
  } = formatHours(
    formattedEventDate,
    specialOpening,
    opening,
    closing,
    filteredSchedule,
  );

  const freeTimes = await calculateFreeTimes(
    specialOpeningArray,
    openTime,
    workingInfo,
    scheduleArray,
    closedTime,
  );

  return freeTimes;
};

export const freeHoursBlipFormat = async ({ userId: id, eventdate, serviceoption }) => {
  const user = await User.findById(id);

  const formattedEventDate = format(eventdate);

  const {
    services, specialOpening, opening, closing, schedule,
  } = user;

  const filteredSchedule = filterDateSchedule(schedule, formattedEventDate);

  const result = await returnFreeTimes(
    formattedEventDate,
    serviceoption,
    services,
    specialOpening,
    opening,
    closing,
    filteredSchedule,
  );

  const blipContent = {
    text: result.length > 0
      ? 'Escolha o melhor horário para você!'
      : 'Que pena! Não temos mais horários para esse dia',
    options: [],
  };

  blipContent.options = result.map((hour, index) => ({
    text: hour.split(' ')[1],
    order: index + 1,
    type: 'text/plain',
    value: hour.split(' ')[1],
  }));

  return blipContent;
};
