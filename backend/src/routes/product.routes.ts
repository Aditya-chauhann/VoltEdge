import { Router } from 'express';
import {
  listProducts, searchProducts, autosuggest,
  getProduct, getProductsByCategory, getCategories, syncProducts,
  getBanners,
} from '../controllers/product.controller';
import { adminOnly } from '../middleware/admin.middleware';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Admin / Sync
router.post('/sync', protect, adminOnly, syncProducts);

// Public routes
router.get('/',                      listProducts);
router.get('/search',                searchProducts);
router.get('/autosuggest',           autosuggest);
router.get('/categories',            getCategories);
router.get('/category/:slug',        getProductsByCategory);
router.get('/banners',               getBanners);
router.get('/:id',                   getProduct);

export default router;
