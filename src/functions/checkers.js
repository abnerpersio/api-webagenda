const moment = require('moment-timezone');
const errorHandler = require('./errorHandler');

require('moment/locale/pt-br');
moment.tz.setDefault('America/Sao_Paulo');

const fullDateFormatPattern = 'DD-MM-YYYY HH:mm';
const dateFormatPattern = 'DD-MM-YYYY';
const dayFormatPattern = 'ddd';

function required(...params) {
  throw new Error(`Parametro necessário! ${params}`);
}

module.exports = {
  addTheServiceTime(date, timeInMinute) {
    let timeInSeconds = timeInMinute * 60;
    return moment(date, fullDateFormatPattern)
      .add(timeInSeconds, 's')
      .format(fullDateFormatPattern);
  },

  checkBeetween(comparingHours, hoursEvent) {
    return hoursEvent.map((hour) => {
      return moment(hour, fullDateFormatPattern).isBetween(
        moment(comparingHours[0], fullDateFormatPattern),
        moment(comparingHours[1], fullDateFormatPattern),
        'minute',
        '[]'
      );
    });
  },

  checkBeetweenAndSame(comparingHours, hoursEvent) {
    const result = [];
    hoursEvent.map((hour, index) => {
      var firstItem = moment(hour, fullDateFormatPattern).isBetween(
        moment(comparingHours[0], fullDateFormatPattern),
        moment(comparingHours[1], fullDateFormatPattern),
        'minute'
      );
      //
      var secondItem = moment(hoursEvent[index], fullDateFormatPattern).isSame(
        moment(comparingHours[index], fullDateFormatPattern)
      );
      //
      result.push(firstItem) && result.push(secondItem);
    });
    return result;
  },

  checkBeetweenNoCoutingBorders(comparingHours, hoursEvent) {
    return hoursEvent.map((hour) => {
      return moment(hour, fullDateFormatPattern).isBetween(
        moment(comparingHours[0], fullDateFormatPattern),
        moment(comparingHours[1], fullDateFormatPattern),
        'minute'
      );
    });
  },

  getCompleteDate(completeDate, hours) {
    const dateFormat = moment(completeDate, fullDateFormatPattern).format(
      dateFormatPattern
    );

    return hours.map(
      (hour, index) => (hours[index] = dateFormat.concat(' ', hour))
    );
  },

  formatHours(
    hoursEvent,
    specialOpeningTime,
    openingInfo,
    closingInfo,
    schedule
  ) {
    const startEventHour =
      typeof hoursEvent == 'string' ? hoursEvent : hoursEvent[0];

    function returnArray(array) {
      var arr = [];
      return (arr = array.map(
        (object, index) => (arr[index] = [object.from, object.to])
      ));
    }

    function returnWorkingInfo(object, day) {
      let returnObj = {};
      returnObj[day] = { working: object[day].working };
      return returnObj;
    }

    function returnOpening(object, day) {
      return (returnObj = [object[day].from, object[day].to]);
    }

    const dayEvent = moment(startEventHour, fullDateFormatPattern).format(
      dayFormatPattern
    );

    const openingTime = returnOpening(openingInfo, dayEvent);
    const closingTime = returnOpening(closingInfo, dayEvent);

    const [formattedStartWorking, formattedEndWorking] = this.getCompleteDate(
      startEventHour,
      [openingTime[0], openingTime[1]]
    );

    const [formattedStartClose, formattedEndClose] = this.getCompleteDate(
      startEventHour,
      [closingTime[0], closingTime[1]]
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
  },

  // checkers
  // 1.
  checkSpecialWorking(specialOpening, hoursEvent) {
    return new Promise((resolve, reject) => {
      if (!specialOpening || !hoursEvent) reject('Parametros faltando!');
      resolve(
        specialOpening.map((time) => this.checkBeetween(time, hoursEvent))
      );
    });
  },

  // 2.
  checkWorkingInHours(hoursWorking, hoursEvent) {
    return new Promise((resolve, reject) => {
      if (!hoursWorking || !hoursEvent) reject('Parametros faltando!');
      resolve(this.checkBeetween(hoursWorking, hoursEvent));
    });
  },

  // 3.
  checkClosedInHours(closedTime, hoursEvent) {
    return new Promise((resolve, reject) => {
      if (!closedTime || !hoursEvent) reject('Parametros faltando!');
      resolve(this.checkBeetweenAndSame(closedTime, hoursEvent));
    });
  },

  // 4.
  checkEventBlocking(schedule, hoursEvent) {
    return new Promise((resolve, reject) => {
      if (!schedule || !hoursEvent) reject('Parametros faltando!');
      resolve(
        schedule.map((event) => this.checkBeetweenAndSame(event, hoursEvent))
      );
    });
  },

  checkHours(
    hoursEvent = required('horario do evento'),
    specialOpening = required('abertura especial'),
    openingTime = required('horario abertura'),
    workingInfo = required('informações de trabalho'),
    closedTime = required('horario fechamento'),
    schedule = required('agenda')
  ) {
    function checkFalse(input) {
      if (input.length > 0) return input.some(checkFalse);
      return input == false;
    }

    function checkTrue(input) {
      if (input?.length > 0) return input.some(checkTrue);
      return input == true;
    }

    function getSomeInArray(arr, cb) {
      return arr.map((item) => item.some(cb)).some(cb);
    }

    return this.checkSpecialWorking(specialOpening, hoursEvent)
      .then((result) => {
        var checkingArr = getSomeInArray(result, checkTrue);
        if (checkingArr) {
          return this.checkEventBlocking(schedule, hoursEvent)
            .then((result) => {
              var checkingArr = getSomeInArray(result, checkTrue);
              if (checkingArr) {
                return { status: 500, response: 'evento bloqueando' };
              } else {
                return { status: 200 };
              }
            })
            .catch((error) => ({ status: 500, response: error }));
        }
        //
        const dayEvent = moment(hoursEvent, fullDateFormatPattern).format(
          dayFormatPattern
        );
        if (!workingInfo[dayEvent]['working']) {
          return { status: 500, response: 'não trabalha no dia' };
        }
        //
        return this.checkWorkingInHours(openingTime, hoursEvent)
          .then((result) => {
            var checkingArr = result.every(checkTrue);
            if (checkingArr) {
              return this.checkClosedInHours(closedTime, hoursEvent)
                .then((result) => {
                  var checkingArr = result.every(checkFalse);
                  if (checkingArr) {
                    return this.checkEventBlocking(schedule, hoursEvent)
                      .then((result) => {
                        var checkingArr = getSomeInArray(result, checkTrue);
                        if (checkingArr) {
                          return { status: 500, response: 'evento bloqueando' };
                        } else {
                          return { status: 200 };
                        }
                      })
                      .catch((error) => ({ status: 500, response: error }));
                  } else {
                    return { status: 500, response: 'fechado nesse horário' };
                  }
                })
                .catch((error) => ({ status: 500, response: error }));
            } else {
              return { status: 500, response: 'fechados no horario' };
            }
          })
          .catch((error) => ({ status: 500, response: error }));
      })
      .catch((error) => ({ status: 500, response: error }));
  },

  customEventCheckHours(
    hoursEvent = required('horario do evento'),
    schedule = required('agenda')
  ) {
    //
    function checkTrue(input) {
      if (input?.length > 0) return input.some(checkTrue);
      return input == true;
    }

    function getSomeInArray(arr, cb) {
      return arr.map((item) => item.some(cb)).some(cb);
    }

    return this.checkEventBlocking(schedule, hoursEvent)
      .then((result) => {
        var checkingArr = getSomeInArray(result, checkTrue);
        if (checkingArr) {
          return { status: 500, response: 'evento bloqueando' };
        } else {
          return { status: 200 };
        }
      })
      .catch((error) => ({ status: 500, response: error }));
  },

  returnFreeTimes(
    eventDate,
    serviceOption,
    services,
    specialOpening,
    opening,
    closing,
    schedule
  ) {
    return new Promise((resolve, reject) => {
      const {
        hoursEvent,
        specialOpeningArray,
        openTime,
        workingInfo,
        closedTime,
        scheduleArray,
      } = this.formatHours(
        eventDate,
        specialOpening,
        opening,
        closing,
        schedule
      );
      //
      function splitServices(servicesOptionObj) {
        return servicesOptionObj.split(',')
          ? servicesOptionObj.split(',')
          : [services];
      }

      function calculateDurations(arr) {
        let sum = 0;
        arr.forEach(
          (itemIndex) => (sum += Number(services[itemIndex].serviceTime))
        );
        return sum;
      }

      servicesArray = splitServices(serviceOption);
      //
      let indexServices = [];
      servicesArray.forEach((item, index) => {
        if (item) {
          indexServices[index] = services.findIndex(
            (eventSchedule) => eventSchedule.serviceName === item
          );
        }
      });
      //
      const serviceDuration = String(calculateDurations(indexServices));
      //
      return this.calculateFreeTimes(
        specialOpeningArray,
        openTime,
        workingInfo,
        scheduleArray,
        closedTime
      )
        .then((freeTimes) => {
          var freeUniqueHours = [];
          freeTimes.map((freeTime) => {
            if (
              moment(freeTime[0], fullDateFormatPattern).diff(
                moment(),
                'minutes'
              ) < 0
            )
              return false;
            var durationInterval = moment(
              freeTime[1],
              fullDateFormatPattern
            ).diff(moment(freeTime[0], fullDateFormatPattern), 'minute');
            //
            if (durationInterval > serviceDuration) {
              var multiple = ~~(durationInterval / serviceDuration);
              for (let i = 0; i < multiple; i++)
                freeUniqueHours.push(
                  moment(freeTime[0], fullDateFormatPattern)
                    .add(i * serviceDuration, 'minutes')
                    .format(fullDateFormatPattern)
                );
            }
          });
          // ordering array for better view
          freeUniqueHours.sort((a, b) => {
            if (a.split(' ')[1].split(':')[0] > b.split(' ')[1].split(':')[0])
              return 1;
            if (a.split(' ')[1].split(':')[0] < b.split(' ')[1].split(':')[0])
              return -1;
            return 0;
          });

          resolve(freeUniqueHours);
        })
        .catch((error) => reject(error));
    });
  },

  calculateFreeTimes(
    specialOpeningTime = required('horario abertura especial'),
    openingTime = required('horario abertura'),
    workingInfo = required('aberturas'),
    schedule = required('agenda'),
    closingTime = required('horario fechamento')
  ) {
    return new Promise((resolve, reject) => {
      function checkTrue(input) {
        if (input?.length > 0) return input.some(checkTrue);
        return input == true;
      }

      const dayEvent = moment(openingTime[0], fullDateFormatPattern).format(
        dayFormatPattern
      );

      if (!workingInfo[dayEvent].working) {
        resolve([]);
      }

      function orderArrayAndGetNew(array) {
        return array.sort((a, b) => {
          if (
            moment(a, fullDateFormatPattern).diff(
              moment(b, fullDateFormatPattern)
            ) > 0
          )
            return 1;
          if (
            moment(a, fullDateFormatPattern).diff(
              moment(b, fullDateFormatPattern)
            ) < 0
          )
            return -1;
          return 0;
        });
      }

      var freeTimes = [openingTime];
      //
      if (specialOpeningTime?.length > 0) {
        specialOpeningTime?.map((specialOpening, indexSpecial) => {
          if (
            moment(specialOpening, fullDateFormatPattern).format(
              dateFormatPattern
            ) ==
            moment(openingTime[0], fullDateFormatPattern).format(
              dateFormatPattern
            )
          )
            freeTimes.push(specialOpening);
        });
      }
      //
      if (schedule?.length > 0) {
        schedule?.map((event, indexSchedule) => {
          freeTimes.map((freeTime, indexFreeTimes) => {
            var checkBlocking = this.checkBeetween(freeTime, [
              event[0],
              event[1],
            ]);
            if (checkBlocking.some(checkTrue)) {
              var arrayOrdered = orderArrayAndGetNew([
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
      //
      if (closingTime?.length > 0) {
        freeTimes.map((freeTime, indexFreeTimes) => {
          var checkBlocking = this.checkBeetween(freeTime, closingTime);
          if (checkBlocking.some(checkTrue)) {
            var arrayOrdered = orderArrayAndGetNew([
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
        return arr[0] != arr[1];
      }

      freeTimes = freeTimes.filter(checkSame);
      resolve(freeTimes);
    });
  },

  formatAndCheckHours(
    eventFormattedHours,
    specialOpeningTime,
    openingInfo,
    closingInfo,
    schedule
  ) {
    return new Promise((resolve, reject) => {
      const {
        hoursEvent,
        specialOpeningArray,
        openTime,
        workingInfo,
        closedTime,
        scheduleArray,
      } = this.formatHours(
        eventFormattedHours,
        specialOpeningTime,
        openingInfo,
        closingInfo,
        schedule
      );
      //
      resolve(
        this.checkHours(
          hoursEvent,
          specialOpeningArray,
          openTime,
          workingInfo,
          closedTime,
          scheduleArray
        )
      );
    });
  },

  checkHoursCustomEvent(eventFormattedHours, schedule) {
    return new Promise((resolve, reject) => {
      //
      function returnArray(array) {
        var arr = [];
        return (arr = array.map(
          (object, index) => (arr[index] = [object.from, object.to])
        ));
      }
      //
      const hoursEvent = eventFormattedHours;
      const scheduleArray = returnArray(schedule);
      //
      resolve(this.customEventCheckHours(hoursEvent, scheduleArray));
    });
  },
};
// used for checking free times and check event blocking before updating or saving
