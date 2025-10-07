const { body } = require('express-validator');
const { handleValidationErrors } = require('./common');

const validateProfile = [
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('height.value')
    .optional()
    .isFloat()
    .withMessage('Height value must be a number')
    .custom((value, { req }) => {
      if (!value) return true;
      const unit = req.body.height?.unit;
      if (unit === 'cm') {
        if (value < 50 || value > 300) {
          throw new Error('Height must be between 50 and 300 cm');
        }
      } else if (unit === 'ft') {
        if (value < 1.5 || value > 10) {
          throw new Error('Height must be between 1.5 and 10 feet');
        }
      }
      return true;
    }),
  
  body('height.unit')
    .optional()
    .isIn(['cm', 'ft'])
    .withMessage('Height unit must be cm or ft'),
  
  body('weight.value')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500'),
  
  body('weight.unit')
    .optional()
    .isIn(['kg'])
    .withMessage('Weight unit must be kg'),
  
  body('fitnessGoal')
    .optional()
    .isIn([
      'weight_loss',
      'weight_gain',
      'muscle_building',
      'endurance',
      'general_fitness',
      'strength_training',
      'cardio_fitness',
      'flexibility',
      'maintenance'
    ])
    .withMessage('Invalid fitness goal'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  handleValidationErrors
];

module.exports = { validateProfile };


