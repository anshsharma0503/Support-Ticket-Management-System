import { Comment } from '../models/Comment.js';
import { Ticket } from '../models/Ticket.js';
import { ticketEvents, EVENTS } from '../events/eventEmitter.js';

export const addComment = async (ticketId, message, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Permission check: Non-admins can only comment on tickets they own
  if (user.role !== 'ADMIN' && ticket.createdBy.toString() !== user._id.toString()) {
    const error = new Error('Forbidden. You can only comment on your own tickets.');
    error.statusCode = 403;
    throw error;
  }

  const comment = await Comment.create({
    ticket: ticketId,
    author: user._id,
    authorRole: user.role,
    message
  });

  await comment.populate('author', 'name email role');

  // Trigger event-driven workflow
  ticketEvents.emit(EVENTS.COMMENT_ADDED, { ticket, comment, user });

  return comment;
};

export const getTicketComments = async (ticketId, user) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Permission check: Non-admins can only read comments on tickets they own
  if (user.role !== 'ADMIN' && ticket.createdBy.toString() !== user._id.toString()) {
    const error = new Error('Forbidden. You cannot view comments for tickets you do not own.');
    error.statusCode = 403;
    throw error;
  }

  const comments = await Comment.find({ ticket: ticketId })
    .populate('author', 'name email role')
    .sort({ createdAt: 1 }); // Chronological order

  return comments;
};
