import { ActivityLog } from '../models/ActivityLog.js';

export const getActivityLogs = async (query = {}) => {
  const { ticketId, action, actorRole, page = 1, limit = 20 } = query;
  const filter = {};

  if (ticketId) filter.ticket = ticketId;
  if (action) filter.action = action;
  if (actorRole) filter.actorRole = actorRole;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('actor', 'name email role')
      .populate('ticket', 'title status priority category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ActivityLog.countDocuments(filter)
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

export const getTicketActivityLogs = async (ticketId) => {
  return await ActivityLog.find({ ticket: ticketId })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 });
};
