export const mockAdminUser = {
  username: 'mock-admin',
  password: 'pass',
  role: 'admin',
  services: [
    {
      serviceName: 'cabelo',
      serviceTime: '20',
    },
    {
      serviceName: 'barba',
      serviceTime: '30',
    },
  ],
  opening: {
    seg: {
      working: true,
      from: '08:00',
      to: '10:00',
    },
    ter: {
      working: true,
      from: '08:00',
      to: '10:00',
    },
    qua: {
      working: true,
      from: '08:00',
      to: '10:00',
    },
    qui: {
      working: true,
      from: '08:00',
      to: '10:00',
    },
    sex: {
      working: true,
      from: '08:00',
      to: '10:00',
    },
    sáb: {
      working: true,
      from: '08:00',
      to: '10:00',
    },
    dom: {
      working: true,
      from: '08:00',
      to: '16:00',
    },
  },
  closing: {
    seg: {
      from: '12:00',
      to: '13:00',
    },
    ter: {
      from: '12:00',
      to: '13:00',
    },
    qua: {
      from: '12:00',
      to: '13:00',
    },
    qui: {
      from: '12:00',
      to: '13:00',
    },
    sex: {
      from: '12:00',
      to: '13:00',
    },
    sáb: {
      from: '12:00',
      to: '13:00',
    },
    dom: {
      from: '16:00',
      to: '18:00',
    },
  },
};

export const mockUser = {
  username: 'user',
  password: 'pass',
};

export const firstEvent = {
  clientName: 'Abner',
  service: 'cabelo',
  clientPhone: '1997419880',
  professional: 'Abner',
  eventdate: 'amanha',
  eventhours: '11:00',
};
