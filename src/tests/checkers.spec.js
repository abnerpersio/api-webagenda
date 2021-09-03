import {
  addTheServiceTime,
  returnFreeTimes,
  calculateFreeTimes,
  formatAndCheckHours,
  checkHoursCustomEvent,
  formatHours,
} from '../shared/utils/checkers';

describe('Checkers testing', () => {
  test.each([
    ['10-08-2021 10:00', '40', '10-08-2021 10:40'],
    ['10-08-2021 10:00', '60', '10-08-2021 11:00'],
    ['10-08-2021 12:30', '20', '10-08-2021 12:50'],
    ['10-08-2021 12:00', '30', '10-08-2021 12:30'],
    ['10-08-2021 14:00', '110', '10-08-2021 15:50'],
  ])('should return added service time %i to %i', (received, sum, expected) => {
    const result = addTheServiceTime(received, sum);

    expect(result).toBe(expected);
  });

  test('should format hours correctly', () => {
    const result = formatHours(
      ['10-08-2021 10:00', '10-08-2021 12:00'],
      [
        {
          from: '10-08-2021 14:00',
          to: '10-08-2021 15:00',
        },
      ],
      {
        seg: {
          working: true,
          from: '08:00',
          to: '18:00',
        },
        ter: {
          working: true,
          from: '08:00',
          to: '18:00',
        },
      },
      {
        seg: {
          from: '12:00',
          to: '13:00',
        },
        ter: {
          from: '08:00',
          to: '18:00',
        },
      },
      [],
    );

    expect(result).toStrictEqual({
      hoursEvent: ['10-08-2021 10:00', '10-08-2021 12:00'],
      specialOpeningArray: [
        ['10-08-2021 14:00', '10-08-2021 15:00'],
      ],
      openTime: ['10-08-2021 08:00', '10-08-2021 18:00'],
      workingInfo: { ter: { working: true } },
      closedTime: ['10-08-2021 08:00', '10-08-2021 18:00'],
      scheduleArray: [],
    });
  });
});
