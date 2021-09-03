import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';
import { firstEvent, mockAdminUser } from './fixtures/users';
import UserController from '../controllers/UserController';

const mockResponse = {
  json: jest.fn(),
  status(responseStatus) {
    return this;
  },
};

describe('Schedule Controller', () => {
  beforeAll((done) => {
    mongoose.connect(process.env.DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        dbName: 'jest_db_webagenda',
      },
      () => done());
  });

  afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(() => done());
    });
  });

  test('Should get the list of events', async () => {
    await UserController.create(
      { body: mockAdminUser },
      mockResponse,
    );

    const response = await request(app)
      .get('/events')
      .set('x-wa-username', mockAdminUser.username)
      .set('x-wa-password', mockAdminUser.password);

    expect(response.status).toBe(200);
  });

  test('Should create a new event', async () => {
    const response = await request(app)
      .post('/events')
      .set('Content-Type', 'application/json')
      .set('x-wa-username', mockAdminUser.username)
      .set('x-wa-password', mockAdminUser.password)
      .send(firstEvent);

    expect(response.body.clientName).toBe(firstEvent.clientName);
    expect(response.status).toBe(201);
  });
});
