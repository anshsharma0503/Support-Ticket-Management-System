import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createTicketValidator,
  updateTicketValidator
} from '../validators/ticketValidator.js';
import { createCommentValidator } from '../validators/commentValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = express.Router();

// All ticket routes require authentication
router.use(authenticate);

router.post('/', createTicketValidator, validateRequest, createTicket);
router.get('/my', getMyTickets);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicketValidator, validateRequest, updateTicket);
router.delete('/:id', deleteTicket);

// Nested comment routes on ticket
router.post('/:id/comments', createCommentValidator, validateRequest, addComment);
router.get('/:id/comments', getComments);

export default router;
