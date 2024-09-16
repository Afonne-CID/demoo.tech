// tests/models/User.test.js
const { User } = require('../../models');
const sequelize = require('../../config/database');

beforeAll(async () => {
await sequelize.sync({ force: true });
});

afterAll(async () => {
await sequelize.close();
});

describe('User Model', () => {
it('should create a new user', async () => {
    const user = await User.create({
    email: 'test@example.com',
    password_hash: 'password123',
    user_type: 'individual'
    });
    expect(user.email).toBe('test@example.com');
    expect(user.user_type).toBe('individual');
});

it('should not create a user with invalid email', async () => {
    await expect(User.create({
    email: 'invalid-email',
    password_hash: 'password123',
    user_type: 'individual'
    })).rejects.toThrow();
});
});
