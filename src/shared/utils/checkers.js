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

const checkBeetween = (comparingHours, hoursEvent) => hoursEvent.map((hour) => moment(hour, fullDateFormatPattern).isBetween(
  moment(comparingHours[0], fullDateFormatPattern),
  moment(comparingHours[1], fullDateFormatPattern),
  'minute',
  '[]',
));

const checkBeetweenAndSame = (comparingHours, hoursEvent) => {
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
    specialOpening.map((time) => checkBeetween(time, hoursEvent)),
  );
});

// 2.
const checkWorkingInHours = (hoursWorking, hoursEvent) => new Promise((resolve, reject) => {
  if (!hoursWorking || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(checkBeetween(hoursWorking, hoursEvent));
});

// 3.
const checkClosedInHours = (closedTime, hoursEvent) => new Promise((resolve, reject) => {
  if (!closedTime || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(checkBeetweenAndSame(closedTime, hoursEvent));
});

// 4.
const checkEventBlocking = (schedule, hoursEvent) => new Promise((resolve, reject) => {
  if (!schedule || !hoursEvent) reject(new Error('Parametros faltando!'));
  resolve(
    schedule.map((event) => checkBeetweenAndSame(event, hoursEvent)),
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

  // return moment(hoursEvent, fullDateFormatPattern).isBefore(moment())
  //   ? { status: 500, response: 'este horário já passou' }
  //   : checkSpecialWorking(specialOpening, hoursEvent)
  //     .then((result) => {
  //       const checkingArr = getSomeInArray(result, checkTrue);
  //       if (checkingArr) {
  //         return checkEventBlocking(schedule, hoursEvent)
  //           .then((result) => {
  //             const checkingArr = getSomeInArray(result, checkTrue);
  //             if (checkingArr) {
  //               return { status: 500, response: 'evento bloqueando' };
  //             }
  //             return { status: 200 };
  //           })
  //           .catch((error) => ({ status: 500, response: error }));
  //       }
  //       //
  //       const dayEvent = moment(hoursEvent, fullDateFormatPattern).format(
  //         dayFormatPattern,
  //       );
  //       if (!workingInfo[dayEvent].working) {
  //         return { status: 500, response: 'não trabalha no dia' };
  //       }
  //       //
  //       return checkWorkingInHours(openingTime, hoursEvent)
  //         .then((result) => {
  //           const checkingArr = result.every(checkTrue);
  //           if (checkingArr) {
  //             return checkClosedInHours(closedTime, hoursEvent)
  //               .then((result) => {
  //                 const checkingArr = result.every(checkFalse);
  //                 if (checkingArr) {
  //                   return checkEventBlocking(schedule, hoursEvent)
  //                     .then((result) => {
  //                       const checkingArr = getSomeInArray(result, checkTrue);
  //                       if (checkingArr) {
  //                         return {
  //                           status: 500,
  //                           response: 'evento bloqueando',
  //                         };
  //                       }
  //                       return { status: 200 };
  //                     })
  //                     .catch((error) => ({ status: 500, response: error }));
  //                 }
  //                 return {
  //                   status: 500,
  //                   response: 'fechado nesse horário',
  //                 };
  //               })
  //               .catch((error) => ({ status: 500, response: error }));
  //           }
  //           return { status: 500, response: 'fechados no horario' };
  //         })
  //         .catch((error) => ({ status: 500, response: error }));
  //     })
  //     .catch((error) => ({ status: 500, response: error }));

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

  if (specialOpeningTime?.length > 0) {
    specialOpeningTime?.map((specialOpening, indexSpecial) => {
      if (
        moment(specialOpening, fullDateFormatPattern).format(
          dateFormatPattern,
        )
          === moment(openingTime[0], fullDateFormatPattern).format(
            dateFormatPattern,
          )
      ) { freeTimes.push(specialOpening); }
    });
  }

  if (schedule?.length > 0) {
    schedule?.map((event, indexSchedule) => {
      freeTimes.map((freeTime, indexFreeTimes) => {
        const checkBlocking = checkBeetween(freeTime, [
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
      });
    });
  }

  if (closingTime?.length > 0) {
    freeTimes.map((freeTime, indexFreeTimes) => {
      const checkBlocking = checkBeetween(freeTime, closingTime);
      if (checkBlocking.some(checkTrue)) {
        const arrayOrdered = orderArrayAndGetNew([
          freeTime[0],
          freeTime[1],
          closingTime[0],
          closingTime[1],
        ]);
        freeTimes[indexFreeTimes] = [arrayOrdered[0], arrayOrdered[1]];
        freeTimes.push([arrayOrdered[2], arrayOrdered[3]]);
      }
    });
  }

  function checkSame(arr) {
    return arr[0] !== arr[1];
  }

  freeTimes = freeTimes.filter(checkSame);
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
    // let sum = 0;

    // arr.forEach(
    //   (itemIndex) => {
    //     sum += Number(services[itemIndex].serviceTime);
    //   },
    // );

    // return sum;
    return arr.reduce(
      (acc, curr, index) => acc + Number(services[index].serviceTime), 0,
    );
  }

  const servicesArray = splitServices(servicesOptions);
  const indexServices = servicesArray.map((item) => services.findIndex(
    (serviceSaved) => serviceSaved.serviceName === item,
  ));

  const serviceDuration = String(calculateDurations(indexServices));

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

      console.log({ multiple });

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
