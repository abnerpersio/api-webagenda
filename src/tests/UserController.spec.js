import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server';
import { mockAdminUser, mockUser } from './fixtures/users';
import UserController from '../controllers/UserController';

const mockResponse = {
  json: jest.fn(),
  status(responseStatus) {
    return this;
  },
};

describe('User Controller', () => {
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

  test('Should add user to database', async () => {
    await UserController.create(
      { body: mockAdminUser },
      mockResponse,
    );

    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .set('x-wa-username', mockAdminUser.username)
      .set('x-wa-password', mockAdminUser.password)
      .send(mockUser);

    expect(response.status).toBe(201);
  });

  test('Should not create user when already exists', async () => {
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .set('x-wa-username', mockAdminUser.username)
      .set('x-wa-password', mockAdminUser.password)
      .send(mockAdminUser);

    expect(response.status).toBe(400);
  });

  test('Should find user id by username', async () => {
    const user = await request(app)
      .get(`/users?username=${mockAdminUser.username}`)
      .set('x-wa-username', mockAdminUser.username)
      .set('x-wa-password', mockAdminUser.password);

    const response = await request(app)
      .get(`/users/${user.body.id}`)
      .set('x-wa-username', mockAdminUser.username)
      .set('x-wa-password', mockAdminUser.password);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(mockAdminUser.username);
  });
});
