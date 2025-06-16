const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const updateController = require('../controllers/updateController');

// Validation rules
const updateValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['completed', 'in-progress', 'blocked', 'cancelled'])
    .withMessage('Status must be completed, in-progress, blocked, or cancelled')
];

// Routes
router.get('/', updateController.getUpdates);
router.get('/stats', updateController.getStats);
router.get('/:id', updateController.getUpdate);
router.post('/', updateValidation, updateController.createUpdate);
router.put('/:id', updateValidation, updateController.updateUpdate);
router.delete('/:id', updateController.deleteUpdate);

module.exports = router;