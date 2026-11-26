import * as ticketService from '../services/ticketService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user);
    return sendSuccess(res, 201, 'Ticket created successfully', ticket);
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getUserTickets(req.user._id, req.query);
    return sendSuccess(res, 200, 'My tickets retrieved successfully', result.tickets, result.pagination);
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

export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Ticket updated successfully', ticket);
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user);
    return sendSuccess(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};
