import { EventEmitter } from 'events';

// Custom EventEmitter class with increased max listeners for scalability
class TicketEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(30);
  }
}

export const ticketEvents = new TicketEventEmitter();

// Event constant names
export const EVENTS = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_UPDATED: 'TICKET_UPDATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  TICKET_RESOLVED: 'TICKET_RESOLVED',
  TICKET_DELETED: 'TICKET_DELETED'
};
