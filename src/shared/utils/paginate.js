import moment from 'moment-timezone';
import 'moment/locale/pt-br';

moment.tz.setDefault('America/Sao_Paulo');

export const paginateSchedule = (schedule, date = moment()) => {
  // feito para lidar com a paginação dos dados do banco de dados
  //  para enviar para o client dados paginados
  const parsedDate = moment(date, 'DD-MM-YYYY').isValid() ? moment(date, 'DD-MM-YYYY') : date;

  const rangeStart = moment(parsedDate).subtract(5, 'days');
  const rangeEnd = moment(parsedDate).add(5, 'days');

  return schedule.filter((event) => moment(event.from, 'DD-MM-YYYY HH:mm').isBetween(rangeStart, rangeEnd, undefined, '[]'));
};

export const filterDateSchedule = (schedule, date) => {
  // para retornar apenas a os eventos no mesmo dia de um evento para
  // passar dados menos pesados para as funções
  const parsedDate = moment(date, 'DD-MM-YYYY').isValid() ? moment(date, 'DD-MM-YYYY') : moment(date);
  return schedule.filter((event) => moment(event.from, 'DD-MM-YYYY HH:mm').isSame(moment(parsedDate), 'day'));
};
