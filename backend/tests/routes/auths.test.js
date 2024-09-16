// tests/routes/auth.test.js
const request = require('supertest');
const app = require('../../server');
const { User } = require('../../models');
const sequelize = require('../../config/database');
const testSetup = require('../setup');

jest.mock('../../config/redis', () => require('../mockRedis'));
const { connectRedis, closeRedis } = require('../../config/redis');
let testUser, testToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await connectRedis();
});

afterAll(async () => {
  await sequelize.close();
  await closeRedis();
});
  
describe('Auth Routes', () => {
    beforeEach(async () => {
      await sequelize.sync({ force: true });
      jest.resetModules();
      jest.clearAllMocks();
    });

    it('should create a new user on signup', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          user_type: 'individual'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });
  
    it('should login an existing user', async () => {
      // First, create a user
      await User.create({
        email: 'existinguser@example.com',
        password_hash: 'password123',
        user_type: 'individual'
      });
  
      // Then, try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'existinguser@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should login the test user', async () => {
      const setup = await testSetup();
      testUser = setup.testUser;
      testToken = setup.testToken;

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});