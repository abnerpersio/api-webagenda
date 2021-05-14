const checkers = require('./checkers');
const errorHandler = require('./errorHandler');
const { format } = require('./formatter');

module.exports = {
  checkAndSendResponse(
    eventDate,
    eventHours,
    serviceOption,
    services,
    specialOpeningTime,
    openingInfo,
    closingInfo,
    schedule
  ) {
    return new Promise(async (resolve, reject) => {
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

      const serviceDuration = String(calculateDurations(indexServices));
      //
      const formattedDate = format(eventDate);
      const fullDate = formattedDate?.split(' ')[0]?.concat(' ', eventHours);
      const endEventHours = checkers.addTheServiceTime(
        fullDate,
        serviceDuration
      );

      const eventFormattedHours = [fullDate, endEventHours];

      try {
        const result = await checkers.formatAndCheckHours(
          eventFormattedHours,
          specialOpeningTime,
          openingInfo,
          closingInfo,
          schedule
        );
        if (result.status == 500) {
          reject(`erro ao marcar, ${result.response}`);
        } else if (result.status == 200) {
          resolve(eventFormattedHours);
        }
      } catch (error) {
        return reject(`erro ao marcar ${error}`);
      }
    });
  },

  checkCustomEventAndSendResponse(
    eventDate,
    eventStartHours,
    eventEndHours,
    schedule
  ) {
    return new Promise(async (resolve, reject) => {
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
        const result = await checkers.checkHoursCustomEvent(
          eventFormattedHours,
          schedule
        );
        if (result.status == 500) {
          reject(`erro ao marcar, ${result.response}`);
        } else if (result.status == 200) {
          resolve(eventFormattedHours);
        }
      } catch (error) {
        return reject(`erro ao marcar ${error}`);
      }
    });
  },
};
// used before creating and updating events
