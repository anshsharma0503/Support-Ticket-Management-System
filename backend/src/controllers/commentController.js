import * as commentService from '../services/commentService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const addComment = async (req, res, next) => {
  try {
    const comment = await commentService.addComment(req.params.id, req.body.message, req.user);
    return sendSuccess(res, 201, 'Comment added successfully', comment);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getTicketComments(req.params.id, req.user);
    return sendSuccess(res, 200, 'Ticket comments retrieved successfully', comments);
  } catch (error) {
    next(error);
  }
};
