import { Router } from 'express';
import {
  getDashboard, adminListOrders, adminUpdateOrder, adminBulkUpdateOrders,
  adminListUsers, adminGetUserDetail, adminUpdateUser,
  adminCreateCategory, adminUpdateCategory,
  adminCreateCoupon, adminListCoupons, adminUpdateCoupon,
  adminGetBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner,
  adminGetFinanceConfig, adminUpdateFinanceConfig,
  updateAdminSecret
} from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';
import { updatePolicy } from '../controllers/config.controller';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard',               getDashboard);

// Orders
router.get('/orders',                  adminListOrders);
router.post('/orders/bulk-update',     adminBulkUpdateOrders);
router.put('/orders/:id',              adminUpdateOrder);

// Users
router.get('/users',                   adminListUsers);
router.get('/users/:id',               adminGetUserDetail);
router.put('/users/:id',               adminUpdateUser);

// Categories
router.post('/categories',             adminCreateCategory);
router.put('/categories/:id',          adminUpdateCategory);

// Coupons
router.post('/coupons',                adminCreateCoupon);
router.get('/coupons',                 adminListCoupons);
router.put('/coupons/:id',             adminUpdateCoupon);

// Content (Banners)
router.get('/banners',                 adminGetBanners);
router.post('/banners',                adminCreateBanner);
router.put('/banners/:id',             adminUpdateBanner);
router.delete('/banners/:id',          adminDeleteBanner);

// Policies
router.put('/policies/:type',          updatePolicy);

// Finance
router.get('/finance',                 adminGetFinanceConfig);
router.put('/finance',                 adminUpdateFinanceConfig);

// Settings
router.post('/settings/secret',        updateAdminSecret);

export default router;
