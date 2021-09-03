import { addTheServiceTime, checkHoursCustomEvent, formatAndCheckHours } from './checkers';
import { format } from './formatter';

export const checkAndSendResponse = async (
  eventDate,
  eventHours,
  serviceOption,
  services,
  specialOpeningTime,
  openingInfo,
  closingInfo,
  schedule,
) => {
  function splitServices(servicesOptionObj) {
    return servicesOptionObj.split(',')
      ? servicesOptionObj.split(',')
      : [services];
  }

  function calculateDurations(arr) {
    let sum = 0;
    arr.forEach(
      (itemIndex) => (sum += Number(services[itemIndex].serviceTime)),
    );
    return sum;
  }

  const servicesArray = splitServices(serviceOption);
  //
  const indexServices = [];
  servicesArray.forEach((item, index) => {
    if (item) {
      indexServices[index] = services.findIndex(
        (eventSchedule) => eventSchedule.serviceName === item,
      );
    }
  });

  const serviceDuration = String(calculateDurations(indexServices));
  //
  const formattedDate = format(eventDate);
  const fullDate = formattedDate?.split(' ')[0]?.concat(' ', eventHours);
  const endEventHours = addTheServiceTime(
    fullDate,
    serviceDuration,
  );

  const eventFormattedHours = [fullDate, endEventHours];

  try {
    const result = await formatAndCheckHours(
      eventFormattedHours,
      specialOpeningTime,
      openingInfo,
      closingInfo,
      schedule,
    );
    if (result.status === 500) {
      throw new Error(`erro ao marcar, ${result.response}`);
    } else if (result.status === 200) {
      return eventFormattedHours;
    }
  } catch (error) {
    throw new Error(`erro ao marcar ${error}`);
  }
};

export const checkCustomEventAndSendResponse = async (
  eventDate,
  eventStartHours,
  eventEndHours,
  schedule,
) => {
  //
  const formattedDate = format(eventDate);
  const fullStartDate = formattedDate
    ?.split(' ')[0]
    ?.concat(' ', eventStartHours);
  const fullEndDate = formattedDate
    ?.split(' ')[0]
    ?.concat(' ', eventEndHours);

  const eventFormattedHours = [fullStartDate, fullEndDate];

  try {
    const result = await checkHoursCustomEvent(
      eventFormattedHours,
      schedule,
    );
    if (result.status === 500) {
      throw new Error(`erro ao marcar, ${result.response}`);
    } else if (result.status === 200) {
      return eventFormattedHours;
    }
  } catch (error) {
    throw new Error(`erro ao marcar ${error}`);
  }
};
// used before creating and updating events
