const checkers = require('../functions/checkers');
const errorHandler = require('../functions/errorHandler');
const { format } = require('../functions/formatter');

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
      console.log('formatado ', eventFormattedHours);

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
