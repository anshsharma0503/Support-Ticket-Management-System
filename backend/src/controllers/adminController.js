import * as ticketService from '../services/ticketService.js';
import * as activityLogService from '../services/activityLogService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAllTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getAllTicketsAdmin(req.query);
    return sendSuccess(res, 200, 'All tickets retrieved successfully', result.tickets, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Ticket details retrieved successfully', ticket);
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicketStatus(req.params.id, req.body.status, req.user);
    return sendSuccess(res, 200, `Ticket status updated to ${ticket.status}`, ticket);
  } catch (error) {
    next(error);
  }
};

export const updateTicketPriority = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicketPriority(req.params.id, req.body.priority, req.user);
    return sendSuccess(res, 200, `Ticket priority updated to ${ticket.priority}`, ticket);
  } catch (error) {
    next(error);
  }
};

export const assignAdmin = async (req, res, next) => {
  try {
    const ticket = await ticketService.assignTicketAdmin(req.params.id, req.body.adminId, req.user);
    return sendSuccess(res, 200, 'Ticket assigned admin updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await ticketService.getDashboardStats();
    return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req, res, next) => {
  try {
    const result = await activityLogService.getActivityLogs(req.query);
    return sendSuccess(res, 200, 'Activity logs retrieved successfully', result.logs, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getTicketActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityLogService.getTicketActivityLogs(req.params.id);
    return sendSuccess(res, 200, 'Ticket activity history retrieved successfully', logs);
  } catch (error) {
    next(error);
  }
};
