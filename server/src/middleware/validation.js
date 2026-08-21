const { body, param, query, validationResult } = require('express-validator');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),

  body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required')
];

const validateProductSearch = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be at most 100 characters')
];

const validateBarcodeParam = [
  param('barcode')
    .trim()
    .notEmpty()
    .withMessage('Barcode is required')
    .isLength({ min: 4, max: 32 })
    .withMessage('Barcode must be between 4 and 32 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Barcode contains invalid characters')
];

const validateMongoIdParam = (paramName = 'id') => [
  param(paramName)
    .trim()
    .notEmpty()
    .withMessage(`${paramName} is required`)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`)
];

const validateScanLabel = [
  body('rawText')
    .trim()
    .notEmpty()
    .withMessage('Ingredient text is required')
    .isLength({ min: 3, max: 20000 })
    .withMessage('Ingredient text must be between 3 and 20000 characters'),
  body('productName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name must be at most 200 characters')
];

const validateTracking = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),

  body('quantity')
    .optional()
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('Quantity must be between 0.5 and 100'),

  body('action')
    .optional()
    .isIn(['scan', 'view', 'save', 'compare', 'alternative', 'log'])
    .withMessage('Invalid action type')
];

const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt(),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('skip must be a non-negative integer')
    .toInt(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt()
];

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed'
      },
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProductSearch,
  validateBarcodeParam,
  validateMongoIdParam,
  validateScanLabel,
  validateTracking,
  validatePagination,
  validate
};
