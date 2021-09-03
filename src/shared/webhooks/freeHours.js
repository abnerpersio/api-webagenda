import { freeHoursBlipFormat, freeHoursJsonFormat } from '../utils/freeHoursCalculate';

export const webhookGetFreeHours = async (req, res) => {
  const { id } = req.auth;
  const { getJSON } = req.query;
  const { eventdate, serviceoption } = req.headers;

  if (!eventdate) {
    req.errorCode = 400;
    throw new Error('Data faltando');
  }

  if (getJSON) {
    const freeTimes = await freeHoursJsonFormat({
      userId: id,
      eventdate,
    });

    return res.json(freeTimes);
  }

  const blipContent = await freeHoursBlipFormat({
    userId: id,
    eventdate,
    serviceoption,
  });

  return res.json(blipContent);
};
// used in routes, to get the free times based on a day
