const moment = require('moment');

const formatar = (data) => {
  return moment(data, 'DD/MM/YYYY/HH:mm');
  // .format('DD/MM/YYYYTHH:mm');
};

const events = [
  {
    from: formatar('15/03/2021/12:00'),
    to: formatar('15/03/2021/14:00'),
  },
  {
    from: formatar('15/03/2021/14:00'),
    to: formatar('15/03/2021/15:00'),
  },
];

// console.log(events);

const tentarMarcar = (data) => {
  events.map((item) => {
    console.log(moment(data, 'DD/MM/YYYYTHH:mm').isBetween(item.from, item.to));
  });
};

tentarMarcar('15/03/2021T14:00');
