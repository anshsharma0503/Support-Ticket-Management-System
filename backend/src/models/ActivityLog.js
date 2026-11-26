import mongoose from 'mongoose';

export const ACTIVITY_ACTIONS = [
  'TICKET_CREATED',
  'TICKET_UPDATED',
  'STATUS_CHANGED',
  'PRIORITY_CHANGED',
  'COMMENT_ADDED',
  'TICKET_RESOLVED',
  'TICKET_DELETED'
];

const activityLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor reference is required']
    },
    actorRole: {
      type: String,
      enum: ['USER', 'ADMIN'],
      required: true
    },
    action: {
      type: String,
      enum: {
        values: ACTIVITY_ACTIONS,
        message: '{VALUE} is not a valid activity action'
      },
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Activity logs are immutable once created
  }
);

activityLogSchema.index({ ticket: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
