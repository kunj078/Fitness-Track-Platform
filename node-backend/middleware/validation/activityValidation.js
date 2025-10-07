const { body, query } = require('express-validator');
const { handleValidationErrors } = require('./common');

const validateActivityCreate = [
  body('date').optional().isISO8601().withMessage('date must be a valid date'),
  body('steps').isInt({ min: 0 }).withMessage('steps must be a non-negative integer'),
  body('calories').isInt({ min: 0 }).withMessage('calories must be a non-negative integer'),
  body('workoutMinutes').isInt({ min: 0 }).withMessage('workoutMinutes must be a non-negative integer'),
  handleValidationErrors
];

const validateActivityUpdate = [
  body('date').isISO8601().withMessage('date is required and must be a valid date'),
  body('steps').optional().isInt({ min: 0 }).withMessage('steps must be a non-negative integer'),
  body('calories').optional().isInt({ min: 0 }).withMessage('calories must be a non-negative integer'),
  body('workoutMinutes').optional().isInt({ min: 0 }).withMessage('workoutMinutes must be a non-negative integer'),
  handleValidationErrors
];

const validateActivityQuery = [
  query('from').optional().isISO8601().withMessage('from must be a valid date'),
  query('to').optional().isISO8601().withMessage('to must be a valid date'),
  handleValidationErrors
];

module.exports = {
  validateActivityCreate,
  validateActivityUpdate,
  validateActivityQuery
};


