// validators/productValidators.js
const { body, customSanitizer } = require('express-validator');
const { isValidImage } = require('./imageValidator');

const createProductValidator = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').optional(),
    body('category').isIn([
        'clothing',
        'accessories',
        'footwear',
        'hair',
        'hairstyle',
        'haircut']).withMessage('Invalid product category'),
    // body('image_url').isURL().withMessage('Invalid image URL'),
    body('image_url').custom((value, { req }) => {
        if (!req.file && !value) {
          throw new Error('An image file or image URL is required');
        }
        if (value && !isValidImage(value)) {
          throw new Error('Invalid image URL');
        }
        return true;
    }),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

module.exports = {
    createProductValidator
};
