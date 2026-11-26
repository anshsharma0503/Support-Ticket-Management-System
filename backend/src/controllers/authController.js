import * as authService from '../services/authService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });
    setAuthCookie(res, token);
    return sendSuccess(res, 201, 'Registration successful', { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    setAuthCookie(res, token);
    return sendSuccess(res, 200, 'Login successful', { user, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return sendSuccess(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Current user profile retrieved', req.user);
  } catch (error) {
    next(error);
  }
};
