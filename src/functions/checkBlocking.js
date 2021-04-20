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
      const indexService = services.findIndex(
        (eventSchedule) => eventSchedule.serviceName == serviceOption
      );
      const serviceDuration = services[indexService].serviceTime;
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
};
// used before creating and updating events
