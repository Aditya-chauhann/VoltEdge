import { Router } from 'express';
import {
  register, login,
  forgotPasswordStep1, forgotPasswordStep2,
  getMe, updateProfile,
  addAddress, updateAddress, deleteAddress,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (rate-limited)
router.post('/register',                   authLimiter, register);
router.post('/login',                      authLimiter, login);
router.post('/forgot-password/check',      authLimiter, forgotPasswordStep1);
router.post('/forgot-password/reset',      authLimiter, forgotPasswordStep2);

// Protected routes
router.get('/me',                          protect, getMe);
router.put('/profile',                     protect, updateProfile);
router.post('/addresses',                  protect, addAddress);
router.put('/addresses/:addressId',        protect, updateAddress);
router.delete('/addresses/:addressId',     protect, deleteAddress);

export default router;
