import { Router } from 'express';
import {
  createStripeCheckout, verifyStripeCheckout,
  placeCODOrder, listOrders, getOrder, cancelOrder,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(protect);

router.post('/stripe/create-checkout', createStripeCheckout);
router.post('/stripe/verify-checkout', verifyStripeCheckout);
router.post('/cod',               placeCODOrder);
router.get('/',                   listOrders);
router.get('/:id',                getOrder);
router.post('/:id/cancel',        cancelOrder);

export default router;
