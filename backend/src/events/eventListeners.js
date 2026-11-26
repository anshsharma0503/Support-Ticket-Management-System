import { ticketEvents, EVENTS } from './eventEmitter.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const registerEventListeners = () => {
  ticketEvents.on(EVENTS.TICKET_CREATED, async ({ ticket, user }) => {
    try {
      await ActivityLog.create({
        ticket: ticket._id,
        actor: user._id,
        actorRole: user.role,
        action: 'TICKET_CREATED',
        description: `Ticket "${ticket.title}" created by ${user.name} (${user.role})`,
        metadata: {
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status
        }
      });
    } catch (error) {
      console.error('Failed to log TICKET_CREATED event:', error.message);
    }
  });

  ticketEvents.on(EVENTS.TICKET_UPDATED, async ({ ticket, user, changes }) => {
    try {
      await ActivityLog.create({
        ticket: ticket._id,
        actor: user._id,
        actorRole: user.role,
        action: 'TICKET_UPDATED',
        description: `Ticket details updated by ${user.name} (${user.role})`,
        metadata: { changes }
      });
    } catch (error) {
      console.error('Failed to log TICKET_UPDATED event:', error.message);
    }
  });

  ticketEvents.on(EVENTS.STATUS_CHANGED, async ({ ticket, user, previousStatus, newStatus }) => {
    try {
      await ActivityLog.create({
        ticket: ticket._id,
        actor: user._id,
        actorRole: user.role,
        action: 'STATUS_CHANGED',
        description: `Status changed from "${previousStatus}" to "${newStatus}" by ${user.name} (${user.role})`,
        metadata: { previousStatus, newStatus }
      });

      if (newStatus === 'RESOLVED') {
        ticketEvents.emit(EVENTS.TICKET_RESOLVED, { ticket, user });
      }
    } catch (error) {
      console.error('Failed to log STATUS_CHANGED event:', error.message);
    }
  });

  ticketEvents.on(EVENTS.PRIORITY_CHANGED, async ({ ticket, user, previousPriority, newPriority }) => {
    try {
      await ActivityLog.create({
        ticket: ticket._id,
        actor: user._id,
        actorRole: user.role,
        action: 'PRIORITY_CHANGED',
        description: `Priority updated from "${previousPriority}" to "${newPriority}" by ${user.name} (${user.role})`,
        metadata: { previousPriority, newPriority }
      });
    } catch (error) {
      console.error('Failed to log PRIORITY_CHANGED event:', error.message);
    }
  });

  ticketEvents.on(EVENTS.COMMENT_ADDED, async ({ ticket, comment, user }) => {
    try {
      await ActivityLog.create({
        ticket: ticket._id,
        actor: user._id,
        actorRole: user.role,
        action: 'COMMENT_ADDED',
        description: `New comment posted by ${user.name} (${user.role})`,
        metadata: {
          commentId: comment._id,
          messagePreview: comment.message.substring(0, 100)
        }
      });
    } catch (error) {
      console.error('Failed to log COMMENT_ADDED event:', error.message);
    }
  });

  ticketEvents.on(EVENTS.TICKET_RESOLVED, async ({ ticket, user }) => {
    try {
      await ActivityLog.create({
        ticket: ticket._id,
        actor: user._id,
        actorRole: user.role,
        action: 'TICKET_RESOLVED',
        description: `Ticket marked as RESOLVED by ${user.name} (${user.role})`,
        metadata: {
          resolvedAt: new Date(),
          ticketTitle: ticket.title
        }
      });
    } catch (error) {
      console.error('Failed to log TICKET_RESOLVED event:', error.message);
    }
  });

  ticketEvents.on(EVENTS.TICKET_DELETED, async ({ ticketId, user, title }) => {
    try {
      await ActivityLog.create({
        ticket: ticketId,
        actor: user._id,
        actorRole: user.role,
        action: 'TICKET_DELETED',
        description: `Ticket "${title}" deleted by ${user.name} (${user.role})`,
        metadata: { ticketId, title }
      });
    } catch (error) {
      console.error('Failed to log TICKET_DELETED event:', error.message);
    }
  });
};
