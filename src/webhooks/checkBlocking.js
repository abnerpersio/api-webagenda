const checkers = require('../functions/checkers');

module.exports = {
  checkAndSendResponse(
    eventHours,
    serviceOption,
    services,
    specialOpeningTime,
    openingInfo,
    closingInfo,
    schedule
  ) {
    return new Promise((resolve, reject) => {
      const indexService = services.findIndex(
        (eventSchedule) => eventSchedule.serviceName == serviceOption
      );
      const serviceDuration = services[indexService].serviceTime;
      //
      const endEventHours = checkers.addTheServiceTime(
        eventHours,
        serviceDuration
      );

      const eventFormattedHours = [eventHours, endEventHours];

      return checkers.formatAndCheckHours(
        eventFormattedHours,
        specialOpeningTime,
        openingInfo,
        closingInfo,
        schedule,
        (status, response) => {
          if (status == 500) reject(new Error(`erro ao marcar, ${response}`));
          else if (status == 200) resolve(eventFormattedHours);
          // if (status == 500) cb.status(500).send(`erro ao marcar, ${response}`);
          // else if (status == 200)
          // cb.status(201).send('evento marcado com sucesso!');
        }
      );
    });
  },
};
// used before creating and updating events
