const moment = require('moment-timezone');

require('moment/locale/pt-br');
moment.tz.setDefault('America/Sao_Paulo');

const fullDateFormatPattern = 'DD-MM-YYYY HH:mm';
const listOfDays = {
  segunda: 1,
  terça: 2,
  terca: 2,
  'terÃ§a': 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
  sábado: 6,
  domingo: 7,
  seg: 1,
  ter: 2,
  quar: 3,
  qui: 4,
  sex: 5,
  sab: 6,
  sáb: 6,
  dom: 7,
};

function returnNextWeekDate(dayINeed, pattern) {
  const today = moment().isoWeekday();
  if (today < listOfDays[dayINeed])
    return moment().isoWeekday(listOfDays[dayINeed]).format(pattern);
  else
    return moment()
      .add(1, 'weeks')
      .isoWeekday(listOfDays[dayINeed])
      .format(pattern);
}

function hasNumberInString(string) {
  return /\d/.test(string);
}

function isDateFormatted(string, format) {
  let regex;
  if (format == 'DD-MM-YYYY') {
    regex = /^(0[1-9]|[12][0-9]|3[01])[-](0[1-9]|1[012])[-](19|20)\d\d$/g;
  } else if (format == 'DD/MM/YYYY') {
    regex = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\d\d$/g;
  } else if (format == 'DD MM YYYY') {
    regex = /^(0[1-9]|[12][0-9]|3[01])[ ](0[1-9]|1[012])[ ](19|20)\d\d$/g;
  } else if (format == 'DD-MM') {
    regex = /^(0[1-9]|[12][0-9]|3[01])[-](0[1-9]|1[012])$/g;
  } else if (format == 'DD/MM') {
    regex = /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])$/g;
  } else if (format == 'DD-MM-YYYY HH:mm') {
    regex = /^(0[1-9]|[12][0-9]|3[01])[-](0[1-9]|1[012])[-](19|20)\d\d (0[0-9]|1[0-9]|2[01234])[:]([0-5][0-9])$/g;
  } else {
    return false;
  }
  return regex.test(string);
}

module.exports = {
  format(date) {
    if (isDateFormatted(date, 'DD-MM-YYYY HH:mm')) {
      return date;
    }
    if (isDateFormatted(date, 'DD-MM-YYYY')) {
      return moment(date, 'DD-MM-YYYY').format(fullDateFormatPattern);
    }
    if (isDateFormatted(date, 'DD/MM/YYYY')) {
      return moment(date, 'DD/MM/YYYY').format(fullDateFormatPattern);
    }
    if (isDateFormatted(date, 'DD MM YYYY')) {
      return moment(date, 'DD MM YYYY').format(fullDateFormatPattern);
    }
    if (isDateFormatted(date, 'DD-MM')) {
      return moment(date, 'DD-MM').format(fullDateFormatPattern);
    }
    if (isDateFormatted(date, 'DD/MM')) {
      return moment(date, 'DD/MM').format(fullDateFormatPattern);
    }

    if (hasNumberInString(date)) return date;
    if (listOfDays.hasOwnProperty(date))
      return returnNextWeekDate(date, fullDateFormatPattern);

    switch (date) {
      case 'hoje':
        return moment().format(fullDateFormatPattern);
      case 'Hoje':
        return moment().format(fullDateFormatPattern);
      case 'hoge':
        return moment().format(fullDateFormatPattern);
      case 'amanhã':
        return moment().add('1', 'days').format(fullDateFormatPattern);
      case 'amanha':
      case 'Amanhã':
        return moment().add('1', 'days').format(fullDateFormatPattern);
      case 'Amanha':
        return moment().add('1', 'days').format(fullDateFormatPattern);
      case 'depois de amanha':
        return moment().add('2', 'days').format(fullDateFormatPattern);
      case 'depois de amanhã':
        return moment().add('2', 'days').format(fullDateFormatPattern);
      default:
        return moment().format(fullDateFormatPattern);
    }
  },
};
// used to deal with user responses and format for better working with times
