import { body } from 'express-validator';

export const createCommentValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Comment message is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters')
];
