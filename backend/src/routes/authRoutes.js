import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
