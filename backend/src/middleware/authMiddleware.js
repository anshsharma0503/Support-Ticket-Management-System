import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Authenticate incoming request via HTTP-only cookie or Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization: Bearer <token>
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_development_secret_key');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

/**
 * Authorize roles (RBAC)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Forbidden. Access restricted to role(s): ${roles.join(', ')}`
      );
    }
    next();
  };
};
