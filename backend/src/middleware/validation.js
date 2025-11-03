const { body, param } = require('express-validator');

// User validation rules
const createUserValidation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('role')
        .isIn(['requester', 'validator'])
        .withMessage('Role must be either "requester" or "validator"')
];

const updateUserValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('role')
        .optional()
        .isIn(['requester', 'validator'])
        .withMessage('Role must be either "requester" or "validator"')
];

// Vacation request validation rules
const createVacationRequestValidation = [
    body('user_id')
        .isInt({ min: 1 })
        .withMessage('Valid user ID is required'),
    body('start_date')
        .isDate()
        .withMessage('Valid start date is required (YYYY-MM-DD format)'),
    body('end_date')
        .isDate()
        .withMessage('Valid end date is required (YYYY-MM-DD format)'),
    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Reason must not exceed 500 characters')
];

const approveRejectRequestValidation = [
    body('validator_id')
        .isInt({ min: 1 })
        .withMessage('Valid validator ID is required'),
    body('comments')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comments must not exceed 1000 characters')
];

// Parameter validation rules
const idParamValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid ID is required')
];

const userIdParamValidation = [
    param('userId')
        .isInt({ min: 1 })
        .withMessage('Valid user ID is required')
];

const roleParamValidation = [
    param('role')
        .isIn(['requester', 'validator'])
        .withMessage('Role must be either "requester" or "validator"')
];

module.exports = {
    createUserValidation,
    updateUserValidation,
    createVacationRequestValidation,
    approveRejectRequestValidation,
    idParamValidation,
    userIdParamValidation,
    roleParamValidation
};