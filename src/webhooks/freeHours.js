const checkers = require('../functions/checkers');
const mongoose = require('mongoose');
const errorHandler = require('../functions/errorHandler');
const { format } = require('../functions/formatter');
const { filterDateSchedule } = require('../functions/paginate');

const User = mongoose.model('User');

const sendDataError = (data, res) => {
  return res.status(400).send(`${data} não encontrado!`);
};

module.exports = {
  async getFreeHours(req, res) {
    const { id } = req.auth;
    const { getJSON } = req.query;
    const { eventdate, serviceoption } = req.headers;
    if (!id) sendDataError('Id do usuário', res);

    if (getJSON) {
      return await User.findById(id)
      .then(async (user) => {

        if (!user) sendDataError('Informações', res);
        const formattedEventDate = format(eventdate);
        //
        const { services, specialOpening, opening, closing, schedule } = user;
        const filteredSchedule = filterDateSchedule(schedule, formattedEventDate);
        
        const {
          specialOpeningArray,
          openTime,
          workingInfo,
          closedTime,
          scheduleArray,
        } = checkers.formatHours(
          formattedEventDate,
          specialOpening,
          opening,
          closing,
          schedule
        );

        return checkers.calculateFreeTimes(
          specialOpeningArray,
          openTime,
          workingInfo,
          scheduleArray,
          closedTime
        )
        .then((freeTimes) => { 
          return res.json(freeTimes);
        })
        .catch((error) => errorHandler.reqErrors(error, res));

      })
      .catch((error) => errorHandler.reqErrors(error, res));
      return;
    }

    return await User.findById(id)
      .then(async (user) => {
        //
        if (!user) sendDataError('Informações', res);
        const formattedEventDate = format(eventdate);
        //
        const { services, specialOpening, opening, closing, schedule } = user;
        const filteredSchedule = filterDateSchedule(schedule, formattedEventDate);
        
        return checkers
          .returnFreeTimes(
            formattedEventDate,
            serviceoption,
            services,
            specialOpening,
            opening,
            closing,
            filteredSchedule
          )
          .then((response) => {
            const blipContent = {
              text:
                response.length > 0
                  ? 'Escolha o melhor horário para você!'
                  : 'Que pena! Não temos mais horários para esse dia',
              options: [],
            };
            response.map((hour, index) => {
              blipContent.options.push({
                text: hour.split(' ')[1],
                order: index + 1,
                type: 'text/plain',
                value: hour.split(' ')[1],
              });
            });
            return res.json(blipContent);
          })
          .catch((error) => errorHandler.reqErrors(error, res));
      })
      .catch((error) => errorHandler.reqErrors(error, res));
  },
};
// used in routes, to get the free times based on a day
