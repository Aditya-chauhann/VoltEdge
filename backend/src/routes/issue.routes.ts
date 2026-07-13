import { Router } from 'express';
import { createOrderIssue, getOrderIssues, updateOrderIssue } from '../controllers/issue.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

// User routes
router.post('/orders/:id', protect, createOrderIssue);

// Admin routes
router.get('/', protect, adminOnly, getOrderIssues);
router.patch('/:id', protect, adminOnly, updateOrderIssue);

export default router;
