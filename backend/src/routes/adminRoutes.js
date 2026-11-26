import express from 'express';
import {
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  updateTicketPriority,
  assignAdmin,
  getDashboardStats,
  getActivityLogs,
  getTicketActivityLogs
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  updateStatusValidator,
  updatePriorityValidator
} from '../validators/ticketValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/activity-logs', getActivityLogs);
router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketById);
router.patch('/tickets/:id/status', updateStatusValidator, validateRequest, updateTicketStatus);
router.patch('/tickets/:id/priority', updatePriorityValidator, validateRequest, updateTicketPriority);
router.patch('/tickets/:id/assign', assignAdmin);
router.get('/tickets/:id/activity-logs', getTicketActivityLogs);

export default router;
