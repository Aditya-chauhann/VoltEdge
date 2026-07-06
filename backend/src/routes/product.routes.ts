import { Router } from 'express';
import {
  listProducts, searchProducts, autosuggest,
  getProduct, getProductsByCategory, getCategories, syncProducts
} from '../controllers/product.controller';

const router = Router();

// Sync route
router.post('/sync',                 syncProducts);

// Public routes
router.get('/',                      listProducts);
router.get('/search',                searchProducts);
router.get('/autosuggest',           autosuggest);
router.get('/categories',            getCategories);
router.get('/category/:slug',        getProductsByCategory);
router.get('/:id',                   getProduct);

export default router;
