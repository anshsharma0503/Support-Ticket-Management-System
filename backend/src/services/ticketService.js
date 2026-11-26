import { Ticket } from '../models/Ticket.js';
import { Comment } from '../models/Comment.js';
import { ticketEvents, EVENTS } from '../events/eventEmitter.js';

export const createTicket = async (ticketData, user) => {
  const ticket = await Ticket.create({
    title: ticketData.title,
    description: ticketData.description,
    category: ticketData.category,
    priority: ticketData.priority || 'MEDIUM',
    status: 'OPEN',
    createdBy: user._id
  });

  await ticket.populate('createdBy', 'name email role');

  // Trigger event-driven workflow
  ticketEvents.emit(EVENTS.TICKET_CREATED, { ticket, user });

  return ticket;
};

export const getUserTickets = async (userId, query = {}) => {
  const { status, priority, category, search, page = 1, limit = 10 } = query;
  const filter = { createdBy: userId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedAdmin', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Ticket.countDocuments(filter)
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

export const getTicketById = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId)
    .populate('createdBy', 'name email role')
    .populate('assignedAdmin', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: Non-admins can only view their own tickets
  if (user.role !== 'ADMIN' && ticket.createdBy._id.toString() !== user._id.toString()) {
    const error = new Error('Forbidden. You do not have permission to view this ticket.');
    error.statusCode = 403;
    throw error;
  }

  return ticket;
};

export const updateTicket = async (ticketId, updateData, user) => {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership
  const isOwner = ticket.createdBy._id.toString() === user._id.toString();
  if (user.role !== 'ADMIN' && !isOwner) {
    const error = new Error('Forbidden. You can only edit your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  // Business Rule: Users can only edit tickets while status is OPEN
  if (user.role !== 'ADMIN' && ticket.status !== 'OPEN') {
    const error = new Error('Cannot modify ticket: tickets can only be edited while status is OPEN.');
    error.statusCode = 400;
    throw error;
  }

  // Record changes for activity log
  const changes = {};
  ['title', 'description', 'category'].forEach((field) => {
    if (updateData[field] !== undefined && updateData[field] !== ticket[field]) {
      changes[field] = { from: ticket[field], to: updateData[field] };
      ticket[field] = updateData[field];
    }
  });

  if (Object.keys(changes).length > 0) {
    await ticket.save();
    ticketEvents.emit(EVENTS.TICKET_UPDATED, { ticket, user, changes });
  }

  return ticket;
};

export const deleteTicket = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = ticket.createdBy.toString() === user._id.toString();
  if (user.role !== 'ADMIN' && !isOwner) {
    const error = new Error('Forbidden. You can only delete your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  // Business Rule: Users can only delete tickets while status is OPEN
  if (user.role !== 'ADMIN' && ticket.status !== 'OPEN') {
    const error = new Error('Cannot delete ticket: tickets can only be deleted while status is OPEN.');
    error.statusCode = 400;
    throw error;
  }

  const savedTitle = ticket.title;

  // Clean up associated comments and remove ticket
  await Promise.all([
    Comment.deleteMany({ ticket: ticketId }),
    Ticket.findByIdAndDelete(ticketId)
  ]);

  ticketEvents.emit(EVENTS.TICKET_DELETED, { ticketId, user, title: savedTitle });

  return { message: 'Ticket and associated comments deleted successfully' };
};

export const getAllTicketsAdmin = async (query = {}) => {
  const { status, priority, category, search, assignedAdmin, page = 1, limit = 10 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedAdmin) filter.assignedAdmin = assignedAdmin;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedAdmin', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Ticket.countDocuments(filter)
  ]);

  return {
    tickets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

export const updateTicketStatus = async (ticketId, status, user) => {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = ticket.status;
  if (previousStatus === status) {
    return ticket;
  }

  ticket.status = status;
  await ticket.save();

  ticketEvents.emit(EVENTS.STATUS_CHANGED, {
    ticket,
    user,
    previousStatus,
    newStatus: status
  });

  return ticket;
};

export const updateTicketPriority = async (ticketId, priority, user) => {
  const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email role');

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  const previousPriority = ticket.priority;
  if (previousPriority === priority) {
    return ticket;
  }

  ticket.priority = priority;
  await ticket.save();

  ticketEvents.emit(EVENTS.PRIORITY_CHANGED, {
    ticket,
    user,
    previousPriority,
    newPriority: priority
  });

  return ticket;
};

export const assignTicketAdmin = async (ticketId, adminId, user) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  ticket.assignedAdmin = adminId || null;
  await ticket.save();

  await ticket.populate('assignedAdmin', 'name email role');
  return ticket;
};

export const getDashboardStats = async () => {
  const [total, open, inProgress, resolved, closed, highPriority, urgentPriority] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: 'OPEN' }),
    Ticket.countDocuments({ status: 'IN_PROGRESS' }),
    Ticket.countDocuments({ status: 'RESOLVED' }),
    Ticket.countDocuments({ status: 'CLOSED' }),
    Ticket.countDocuments({ priority: 'HIGH' }),
    Ticket.countDocuments({ priority: 'URGENT' })
  ]);

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
    highPriority,
    urgentPriority
  };
};
