import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required']
    },
    authorRole: {
      type: String,
      enum: ['USER', 'ADMIN'],
      required: true
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Index to retrieve all comments for a ticket efficiently in chronological order
commentSchema.index({ ticket: 1, createdAt: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
