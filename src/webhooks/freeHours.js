const checkers = require('../functions/checkers');
const mongoose = require('mongoose');
const errorHandler = require('../functions/errorHandler');
const formatterData = require('../functions/formatter');

const User = mongoose.model('User');

const sendDataError = (data, res) => {
  return res.status(400).send(`${data} não encontrado!`);
};

module.exports = {
  async getFreeHours(req, res) {
    const { id } = req.auth;
    const { eventdate, serviceoption } = req.headers;
    if (!id) sendDataError('Id do usuário', res);

    return await User.findById(id)
      .then((user) => {
        //
        if (!user) sendDataError('Informações', res);
        const formattedEventDate = formatterData.format(eventdate);
        console.log('formatado: ', formattedEventDate);
        //
        const { services, specialOpening, opening, closing, schedule } = user;
        return checkers
          .returnFreeTimes(
            formattedEventDate,
            serviceoption,
            services,
            specialOpening,
            opening,
            closing,
            schedule
          )
          .then((response) => {
            const blipContent = {
              text:
                response.length > 0
                  ? 'Escolha o melhor horário para você!'
                  : 'Que pena! Já estamos cheios nesse dia',
              options: [],
            };
            response.map((hour, index) => {
              blipContent.options.push({
                text: hour.split(' ')[1],
                order: index + 1,
                type: 'text/plain',
                value: hour,
              });
            });
            return res.json(blipContent);
          })
          .catch((err) => console.error(err));
      })
      .catch((error) => errorHandler(error, res));
  },
};
// used in routes, to get the free times based on a day
