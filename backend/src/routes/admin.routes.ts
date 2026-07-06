import { Router } from 'express';
import {
  getDashboard, adminListOrders, adminUpdateOrder,
  adminListUsers,
  adminCreateCategory, adminUpdateCategory,
  adminCreateCoupon, adminListCoupons, adminUpdateCoupon,
} from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard',               getDashboard);

// Orders
router.get('/orders',                  adminListOrders);
router.put('/orders/:id',              adminUpdateOrder);

// Users
router.get('/users',                   adminListUsers);

// Categories
router.post('/categories',             adminCreateCategory);
router.put('/categories/:id',          adminUpdateCategory);

// Coupons
router.get('/coupons',                 adminListCoupons);
router.post('/coupons',                adminCreateCoupon);
router.put('/coupons/:id',             adminUpdateCoupon);

export default router;
