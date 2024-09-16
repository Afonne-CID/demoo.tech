// validators/userValidators.js
const { body } = require('express-validator');
  
const signupValidator = [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('user_type').isIn(['individual', 'business', 'affiliate']).withMessage('Invalid user type')
];
  
const loginValidator = [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
];
  
module.exports = {
    signupValidator,
    loginValidator
};
