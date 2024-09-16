// tests/routes/products.test.js
const request = require('supertest');
const app = require('../../server');
const { Product } = require('../../models');
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

describe('Product Routes', () => {
    beforeEach(async () => {
      await sequelize.sync({ force: true });
      const setup = await testSetup();
      testUser = setup.testUser;
      testToken = setup.testToken;
      jest.resetModules();
      jest.clearAllMocks();
      await Product.destroy({ where: {} });
    });

    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Product',
          description: 'This is a test product',
          category: 'clothing',
          image_url: 'http://example.com/image.jpg',
          price: 19.99,
        });
    
      if (res.statusCode !== 201) {
        console.log('Response body:', res.body);
      }
  
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test Product');
      expect(res.body).toHaveProperty('image_url', 'http://example.com/image.jpg');
    });
  
    it('should create a new product with file upload', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('image', Buffer.from('fake image content'), 'test-image.jpg')
        .field('name', 'Test Product with Image')
        .field('description', 'This is a test product with an uploaded image')
        .field('category', 'clothing')
        .field('price', 29.99);
  
      if (res.statusCode !== 201) {
        console.log('Response body:', res.body);
      }

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test Product with Image');
      expect(res.body.image_url).toBe('http://example.com/mocked-image-url.jpg');
      // expect(res.body.image_url).toMatch(/^https?:\/\/.+\.jpg|png|gif|bmp|webp$/);
    });
  
    it('should create a new product with valid image URL', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Product with URL',
          description: 'This is a test product with an image URL',
          category: 'accessories',
          image_url: 'http://example.com/image.jpg',
          price: 19.99,
        });
  
      if (res.statusCode !== 201) {
        console.log('Response body:', res.body);
      }
  
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test Product with URL');
      expect(res.body.image_url).toBe('http://example.com/image.jpg');
    });

    it('should return an error if no image file or URL is provided', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Product without Image',
          description: 'This is a test product without an image',
          category: 'footwear',
          price: 9.99,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringMatching(/\b(image|image file|image URL)\b/i)
          })
        ])
      );
    });

    it('should return an error if an invalid image URL is provided', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Product with Invalid URL',
          description: 'This is a test product with an invalid image URL',
          category: 'accessories',
          image_url: 'not-a-valid-url',
          price: 19.99,
        });
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringMatching(/\b(image|image file|image URL)\b/i)
          })
        ])
      );
    });

    it('should get a single product', async () => {
      // First, create a product
      const createdProduct = await Product.create({
        name: 'Single Test Product',
        description: 'This is a test product for single retrieval',
        category: 'clothing',
        image_url: 'http://example.com/single-image.jpg',
        price: 39.99,
        UserId: testUser.id
      });
    
      const res = await request(app)
        .get(`/api/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      if (res.statusCode !== 200) {
        console.log('Response body:', res.body);
      }
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', createdProduct.id);
      expect(res.body).toHaveProperty('name', 'Single Test Product');
    });

    it('should get all products', async () => {
      // First, create a product
      await Product.create({
        name: 'Another Product',
        description: 'This is another test product',
        category: 'accessories',
        image_url: 'http://example.com/another-image.jpg',
        price: 29.99,
        UserId: testUser.id
      });
    
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${testToken}`);
  
      if (res.statusCode !== 200) {
        console.log('Response body:', res.body);
      }

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBeTruthy();
      expect(res.body.items.length).toBeGreaterThan(0);
    });
});
