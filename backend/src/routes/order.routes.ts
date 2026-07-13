import { Router } from 'express';
import {
  createRazorpayOrderHandler, verifyRazorpayPayment,
  placeCODOrder, listOrders, getOrder, cancelOrder,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(protect);

router.post('/razorpay/create',   createRazorpayOrderHandler);
router.post('/razorpay/verify',   verifyRazorpayPayment);
router.post('/cod',               placeCODOrder);
router.get('/',                   listOrders);
router.get('/:id',                getOrder);
router.post('/:id/cancel',        cancelOrder);

export default router;
