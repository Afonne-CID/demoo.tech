// tests/integration/products.test.js
const request = require('supertest');
const app = require('../../server');
const { Product, Tag } = require('../../models');
const sequelize = require('../../config/database');
const testSetup = require('../setup');

const { connectRedis, closeRedis } = require('../../config/redis');
jest.mock('../../config/redis', () => require('../mockRedis'));

// Mock the file upload middleware
jest.mock('../../middleware/fileUpload', () => (req, res, next) => {
  if (req.file) {
    req.file.location = 'http://example.com/mocked-image-url.jpg';
  }
  next();
});

let testUser, testToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await connectRedis();
});

afterAll(async () => {
  await sequelize.close();
  await closeRedis();
});

describe('Product API', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const setup = await testSetup();
    testUser = setup.testUser;
    testToken = setup.testToken;
    jest.resetModules();
    jest.clearAllMocks();
    await Product.destroy({ where: {} });
    await Tag.destroy({ where: {} });
  });

  test('GET /api/products with pagination and sorting', async () => {
    // Create test products
    await Product.bulkCreate([
      { image_url: 'path/here', name: 'Product A', price: 10.00, category: 'clothing', UserId: testUser.id },
      { image_url: 'path/here', name: 'Product B', price: 20.00, category: 'clothing', UserId: testUser.id },
      { image_url: 'path/here', name: 'Product C', price: 15.00, category: 'clothing', UserId: testUser.id },
    ]);

    const response = await request(app)
    .get('/api/products?page=0&size=2&sortBy=price&sortOrder=desc')
    .set('Authorization', `Bearer ${testToken}`);

    if (response.statusCode !== 200) {
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  test('GET /api/products with advanced filtering', async () => {
    // Create test products
    await Product.bulkCreate([
      { image_url: 'path/here', name: 'Shirt', category: 'clothing', price: 25, UserId: testUser.id },
      { image_url: 'path/here', name: 'Pants', category: 'clothing', price: 35, UserId: testUser.id },
      { image_url: 'path/here', name: 'Shoes', category: 'footwear', price: 50, UserId: testUser.id },
    ]);

    const filters = JSON.stringify({
      category: 'clothing',
      price: { start: 20, end: 30 }
    });

    const response = await request(app)
    .get(`/api/products?filters=${filters}`)
    .set('Authorization', `Bearer ${testToken}`);

    if (response.statusCode !== 200) {
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  test('POST /api/products/:id/tags', async () => {
    const product = await Product.create({
      image_url: 'path/here', name: 'Test Product', price: 100, category: 'clothing', UserId: testUser.id
    });

    const response = await request(app)
    .post(`/api/products/${product.id}/tags`)
    .send({ tags: ['tag1', 'tag2'] })
    .set('Authorization', `Bearer ${testToken}`);

    if (response.statusCode !== 200) {
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBeGreaterThan(0);
  });
});
