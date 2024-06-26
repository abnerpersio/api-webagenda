import moment from 'moment-timezone';
import 'moment/locale/pt-br';

moment.tz.setDefault('America/Sao_Paulo');

const fullDateFormatPattern = 'DD-MM-YYYY HH:mm';
const dateFormatPattern = 'DD-MM-YYYY';
const dayFormatPattern = 'ddd';

function required(...params) {
  throw new Error(`Parametro necessário! ${params}`);
}

const addTheServiceTime = (date, timeInMinute) => {
  const timeInSeconds = timeInMinute * 60;
  return moment(date, fullDateFormatPattern)
    .add(timeInSeconds, 's')
    .format(fullDateFormatPattern);
};

export const checkBetween = (comparingHours, hoursEvent) => hoursEvent.map((hour) => moment(hour, fullDateFormatPattern).isBetween(
  moment(comparingHours[0], fullDateFormatPattern),
  moment(comparingHours[1], fullDateFormatPattern),
  'minute',
  '[]',
));

const checkBetweenWithoutBorders = (comparingHours, hoursEvent) => hoursEvent.map((hour) => moment(hour, fullDateFormatPattern).isBetween(
  moment(comparingHours[0], fullDateFormatPattern),
  moment(comparingHours[1], fullDateFormatPattern),
  'minute',
));

const checkBetweenAndSame = (comparingHours, hoursEvent) => {
  const result = [];
  hoursEvent.map((hour, index) => {
    const firstItem = moment(hour, fullDateFormatPattern).isBetween(
      moment(comparingHours[0], fullDateFormatPattern),
      moment(comparingHours[1], fullDateFormatPattern),
      'minute',
    );

    const secondItem = moment(hoursEvent[index], fullDateFormatPattern).isSame(
      moment(comparingHours[index], fullDateFormatPattern),
    );

    return result.push(firstItem) && result.push(secondItem);
  });
  return result;
};

const getCompleteDate = (completeDate, hours) => {
  const dateFormat = moment(completeDate, fullDateFormatPattern).format(
    dateFormatPattern,
  );

  return hours.map(
    (hour) => dateFormat.concat(' ', hour),
  );
};

const formatHours = (
  hoursEvent,
  specialOpeningTime,
  openingInfo,
  closingInfo,
  schedule,
) => {
  const startEventHour = typeof hoursEvent === 'string' ? hoursEvent : hoursEvent[0];

  function returnArray(array) {
    const arr = array.map(
      (object) => ([object.from, object.to]),
    );

    return arr;
  }

  function returnWorkingInfo(object, day) {
    const returnObj = {};
    returnObj[day] = { working: object[day].working };
    return returnObj;
  }

  function returnOpening(object, day) {
    return [object[day].from, object[day].to];
  }

  const dayEvent = moment(startEventHour, fullDateFormatPattern).format(
    dayFormatPattern,
  );

  const openingTime = returnOpening(openingInfo, dayEvent);
  const closingTime = returnOpening(closingInfo, dayEvent);

  const [formattedStartWorking, formattedEndWorking] = getCompleteDate(
    startEventHour,
    [openingTime[0], openingTime[1]],
  );

  const [formattedStartClose, formattedEndClose] = getCompleteDate(
    startEventHour,
    [closingTime[0], closingTime[1]],
  );

  const specialOpeningArray = returnArray(specialOpeningTime);
  const openTime = [formattedStartWorking, formattedEndWorking];
  const workingInfo = returnWorkingInfo(openingInfo, dayEvent);
  const closedTime = [formattedStartClose, formattedEndClose];
  const scheduleArray = returnArray(schedule);

  return {
    hoursEvent,
    specialOpeningArray,
    openTime,
    workingInfo,
    closedTime,
    scheduleArray,
  };
};

// checkers
// 1.
const checkSpecialWorking = (specialOpening, hoursEvent) => new Promise((resolve, reject) => {
  if (!specialOpening || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(
    specialOpening.map((time) => checkBetween(time, hoursEvent)),
  );
});

// 2.
const checkWorkingInHours = (hoursWorking, hoursEvent) => new Promise((resolve, reject) => {
  if (!hoursWorking || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(checkBetween(hoursWorking, hoursEvent));
});

// 3.
const checkClosedInHours = (closedTime, hoursEvent) => new Promise((resolve, reject) => {
  if (!closedTime || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(checkBetweenAndSame(closedTime, hoursEvent));
});

// 4.
const checkEventBlocking = (schedule, hoursEvent) => new Promise((resolve, reject) => {
  if (!schedule || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(
    schedule.map((event) => checkBetweenAndSame(event, hoursEvent)),
  );
});

const checkHours = async (
  hoursEvent = required('horario do evento'),
  specialOpening = required('abertura especial'),
  openingTime = required('horario abertura'),
  workingInfo = required('informações de trabalho'),
  closedTime = required('horario fechamento'),
  schedule = required('agenda'),
) => {
  function checkFalse(input) {
    if (input.length > 0) return input.some(checkFalse);
    return input === false;
  }

  function checkTrue(input) {
    if (input?.length > 0) return input.some(checkTrue);
    return input === true;
  }

  function getSomeInArray(arr, cb) {
    return arr.map((item) => item.some(cb)).some(cb);
  }

  if (moment(hoursEvent, fullDateFormatPattern).isBefore(moment())) {
    return { status: 500, response: 'este horário já passou' };
  }

  const firstResult = await checkSpecialWorking(specialOpening, hoursEvent);
  const checkingFirstArr = getSomeInArray(firstResult, checkTrue);

  if (checkingFirstArr) {
    const secondResult = await checkEventBlocking(schedule, hoursEvent);
    const checkingSecondArr = getSomeInArray(secondResult, checkTrue);

    if (checkingSecondArr) {
      return { status: 500, response: 'evento bloqueando' };
    }

    return { status: 200 };
  }

  const dayEvent = moment(hoursEvent, fullDateFormatPattern).format(
    dayFormatPattern,
  );

  if (!workingInfo[dayEvent].working) {
    return { status: 500, response: 'não trabalha no dia' };
  }

  const thirdResult = await checkWorkingInHours(openingTime, hoursEvent);
  const checkingThirdArr = thirdResult.every(checkTrue);

  if (checkingThirdArr) {
    const fourthResult = await checkClosedInHours(closedTime, hoursEvent);
    const checkingFourthArr = fourthResult.every(checkFalse);

    if (checkingFourthArr) {
      const fifthResult = await checkEventBlocking(schedule, hoursEvent);
      const checkingFifthArr = getSomeInArray(fifthResult, checkTrue);

      if (checkingFifthArr) {
        return {
          status: 500,
          response: 'evento bloqueando',
        };
      }

      return { status: 200 };
    }

    return {
      status: 500,
      response: 'fechado nesse horário',
    };
  }
  return { status: 500, response: 'fechados no horario' };
};

const customEventCheckHours = (
  hoursEvent = required('horario do evento'),
  schedule = required('agenda'),
) => {
  function checkTrue(input) {
    if (input?.length > 0) return input.some(checkTrue);
    return input === true;
  }

  function getSomeInArray(arr, cb) {
    return arr.map((item) => item.some(cb)).some(cb);
  }

  return checkEventBlocking(schedule, hoursEvent)
    .then((result) => {
      const checkingArr = getSomeInArray(result, checkTrue);
      if (checkingArr) {
        return { status: 500, response: 'evento bloqueando' };
      }
      return { status: 200 };
    })
    .catch((error) => ({ status: 500, response: error }));
};

const calculateFreeTimes = (
  specialOpeningTime = required('horario abertura especial'),
  openingTime = required('horario abertura'),
  workingInfo = required('aberturas'),
  schedule = required('agenda'),
  closingTime = required('horario fechamento'),
) => new Promise((resolve, reject) => {
  function checkTrue(input) {
    if (input?.length > 0) return input.some(checkTrue);
    return input === true;
  }

  const dayEvent = moment(openingTime[0], fullDateFormatPattern).format(
    dayFormatPattern,
  );

  if (!workingInfo[dayEvent].working) {
    resolve([]);
  }

  function orderArrayAndGetNew(array) {
    return array.sort((a, b) => {
      if (
        moment(a, fullDateFormatPattern).diff(
          moment(b, fullDateFormatPattern),
        ) > 0
      ) { return 1; }
      if (
        moment(a, fullDateFormatPattern).diff(
          moment(b, fullDateFormatPattern),
        ) < 0
      ) { return -1; }
      return 0;
    });
  }

  let freeTimes = [openingTime];

  specialOpeningTime?.map((specialOpening) => {
    const checkIsSameDay = moment(specialOpening[0], fullDateFormatPattern).isSame(moment(openingTime[0], fullDateFormatPattern), 'day');

    if (checkIsSameDay) {
      freeTimes = [specialOpening];
    }

    return null;
  });

  if (closingTime?.length > 0) {
    freeTimes.map((freeTime, indexFreeTimes) => {
      const checkBlockingWithoutBorders = checkBetweenWithoutBorders(freeTime, closingTime);

      if (checkBlockingWithoutBorders.some(checkTrue)) {
        const arrayOrdered = orderArrayAndGetNew([
          freeTime[0],
          freeTime[1],
          closingTime[0],
          closingTime[1],
        ]);
        freeTimes[indexFreeTimes] = [arrayOrdered[0], arrayOrdered[1]];
        freeTimes.push([arrayOrdered[2], arrayOrdered[3]]);
      }

      return null;
    });
  }

  if (schedule?.length > 0) {
    schedule?.map((event) => {
      freeTimes.map((freeTime, indexFreeTimes) => {
        const checkBlocking = checkBetween(freeTime, [
          event[0],
          event[1],
        ]);
        if (checkBlocking.some(checkTrue)) {
          const arrayOrdered = orderArrayAndGetNew([
            freeTime[0],
            freeTime[1],
            event[0],
            event[1],
          ]);
          freeTimes[indexFreeTimes] = [arrayOrdered[0], arrayOrdered[1]];
          freeTimes.push([arrayOrdered[2], arrayOrdered[3]]);
        }

        return null;
      });

      return null;
    });
  }

  function checkSame(arr) {
    return arr[0] !== arr[1];
  }

  function cleanDuplicatedFreeTimes(arr) {
    const tmpArr = [];

    arr.map((item, index) => {
      const duplicatedWithAny = [];

      for (let i = index + 1; i < arr.length; i += 1) {
        const check = item === arr[i];
        duplicatedWithAny.push(check);
      }

      if (duplicatedWithAny.every((bool) => !bool)) {
        tmpArr.push(item);
      }
    });

    return tmpArr;
  }

  freeTimes = freeTimes.filter(checkSame);
  freeTimes = cleanDuplicatedFreeTimes(freeTimes);

  console.log({ openingTime });

  resolve(freeTimes);
});

const returnFreeTimes = async (
  eventDate,
  servicesOptions,
  services,
  specialOpening,
  opening,
  closing,
  schedule,
) => {
  const {
    hoursEvent,
    specialOpeningArray,
    openTime,
    workingInfo,
    closedTime,
    scheduleArray,
  } = formatHours(
    eventDate,
    specialOpening,
    opening,
    closing,
    schedule,
  );

  function splitServices(servicesOptionObj) {
    return servicesOptionObj.split(',')
      ? servicesOptionObj.split(',')
      : [services];
  }

  function calculateDurations(arr) {
    return arr.reduce(
      (acc, curr, index) => {
        const serviceIndex = arr[index];
        return acc + Number(services[serviceIndex].serviceTime);
      }, 0,
    );
  }

  const servicesArray = splitServices(servicesOptions);
  const indexServices = servicesArray.map((item) => services.findIndex(
    (serviceSaved) => serviceSaved.serviceName === item,
  ));

  if (indexServices.includes(-1)) {
    throw new Error('Service not found');
  }

  const serviceDuration = Number(calculateDurations(indexServices));

  const freeTimes = await calculateFreeTimes(
    specialOpeningArray,
    openTime,
    workingInfo,
    scheduleArray,
    closedTime,
  );

  const freeUniqueHours = [];

  freeTimes.map((freeTime) => {
    if (
      (moment(freeTime[0], fullDateFormatPattern).diff(moment(), 'minutes') < 0)
      && (moment(freeTime[1], fullDateFormatPattern).diff(moment(), 'minutes') < 0)
    ) {
      return null;
    }

    const durationInterval = moment(freeTime[1], fullDateFormatPattern)
      .diff(moment(freeTime[0], fullDateFormatPattern), 'minute');

    if (durationInterval > serviceDuration) {
      const multiple = Math.round(durationInterval / serviceDuration);

      for (let i = 0; i < multiple; i += 1) {
        if (
          moment(freeTime[0], fullDateFormatPattern)
            .add(i * serviceDuration, 'minutes')
            .diff(moment(), 'minutes') >= 0
        ) {
          freeUniqueHours.push(
            moment(freeTime[0], fullDateFormatPattern)
              .add(i * serviceDuration, 'minutes')
              .format(fullDateFormatPattern),
          );
        }
      }
    }

    if (durationInterval === serviceDuration) {
      freeUniqueHours.push(
        moment(freeTime[0], fullDateFormatPattern)
          .format(fullDateFormatPattern),
      );
    }

    return null;
  });

  // ordering array for better view
  freeUniqueHours.sort((a, b) => {
    if (a?.split(' ')[1]?.split(':')[0] > b?.split(' ')[1]?.split(':')[0]) { return 1; }
    if (a?.split(' ')[1]?.split(':')[0] < b?.split(' ')[1]?.split(':')[0]) { return -1; }
    return 0;
  });

  return freeUniqueHours;
};

const formatAndCheckHours = (
  eventFormattedHours,
  specialOpeningTime,
  openingInfo,
  closingInfo,
  schedule,
) => new Promise((resolve, reject) => {
  const {
    hoursEvent,
    specialOpeningArray,
    openTime,
    workingInfo,
    closedTime,
    scheduleArray,
  } = formatHours(
    eventFormattedHours,
    specialOpeningTime,
    openingInfo,
    closingInfo,
    schedule,
  );

  resolve(
    checkHours(
      hoursEvent,
      specialOpeningArray,
      openTime,
      workingInfo,
      closedTime,
      scheduleArray,
    ),
  );
});

const checkHoursCustomEvent = (eventFormattedHours, schedule) => new Promise((resolve) => {
  function returnArray(array) {
    const arr = array.map(
      (object) => ([object.from, object.to]),
    );

    return arr;
  }

  const hoursEvent = eventFormattedHours;
  const scheduleArray = returnArray(schedule);

  resolve(customEventCheckHours(hoursEvent, scheduleArray));
});
// used for checking free times and check event blocking before updating or saving

export {
  addTheServiceTime,
  returnFreeTimes,
  calculateFreeTimes,
  formatAndCheckHours,
  checkHoursCustomEvent,
  formatHours,
};
