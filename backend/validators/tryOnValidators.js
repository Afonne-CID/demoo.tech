// validators/tryOnValidators.js
const { body } = require('express-validator');
  
const createTryOnValidator = [
    body('product_id').isInt().withMessage('Invalid product ID'),
    body('image_url').isURL().withMessage('Invalid image URL')
];
  
module.exports = {
    createTryOnValidator
};
