import { Router } from 'express';
import {
  getCart, addToCart, updateCartItem, removeCartItem,
  clearCart, lockCart, unlockCart, applyCoupon,
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get('/',                  getCart);
router.post('/items',            addToCart);
router.put('/items/:itemId',     updateCartItem);
router.delete('/items/:itemId',  removeCartItem);
router.delete('/',               clearCart);
router.post('/lock',             lockCart);
router.post('/unlock',           unlockCart);
router.post('/coupon',           applyCoupon);

export default router;
