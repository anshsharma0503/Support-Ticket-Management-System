import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  return sendError(res, 404, `Not Found - ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid resource ID format: ${err.value}`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // Handle JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error('[Unhandled Error]:', err);
  }

  return sendError(res, statusCode, message, errors);
};
