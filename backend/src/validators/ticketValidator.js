import { body } from 'express-validator';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '../models/Ticket.js';

export const createTicketValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(TICKET_CATEGORIES)
    .withMessage(`Category must be one of: ${TICKET_CATEGORIES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(TICKET_PRIORITIES)
    .withMessage(`Priority must be one of: ${TICKET_PRIORITIES.join(', ')}`),
  // Ensure users cannot set status or assignedAdmin upon creation
  body('status')
    .optional()
    .custom((val) => {
      if (val && val !== 'OPEN') {
        throw new Error('Tickets can only be created with status OPEN');
      }
      return true;
    }),
  body('assignedAdmin')
    .optional()
    .custom((val) => {
      if (val) {
        throw new Error('Cannot assign administrator during ticket creation');
      }
      return true;
    })
];

export const updateTicketValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('category')
    .optional()
    .trim()
    .isIn(TICKET_CATEGORIES)
    .withMessage(`Category must be one of: ${TICKET_CATEGORIES.join(', ')}`)
];

export const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(TICKET_STATUSES)
    .withMessage(`Status must be one of: ${TICKET_STATUSES.join(', ')}`)
];

export const updatePriorityValidator = [
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(TICKET_PRIORITIES)
    .withMessage(`Priority must be one of: ${TICKET_PRIORITIES.join(', ')}`)
];
