import mongoose from 'mongoose';

export const TICKET_CATEGORIES = [
  'Technical Issue',
  'Billing',
  'Account',
  'General Inquiry',
  'Other'
];

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: TICKET_CATEGORIES,
        message: '{VALUE} is not a valid category'
      }
    },
    priority: {
      type: String,
      enum: {
        values: TICKET_PRIORITIES,
        message: '{VALUE} is not a valid priority'
      },
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: {
        values: TICKET_STATUSES,
        message: '{VALUE} is not a valid status'
      },
      default: 'OPEN'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying & sorting
ticketSchema.index({ createdBy: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ title: 'text', description: 'text' });

export const Ticket = mongoose.model('Ticket', ticketSchema);
