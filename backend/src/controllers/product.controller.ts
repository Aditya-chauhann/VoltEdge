/**
 * Product Controller (Database-Backed Architecture)
 * Fetches products from local MongoDB.
 */

import { Request, Response } from 'express';
import { Category } from '../models/Category.model';
import { Product } from '../models/Product.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';

import { currencyService } from '../services/currency.service';
import { env } from '../config/env';

// ─── Helpers to map DB products to our Frontend Product model ────────────────

function mapToFrontendProduct(p: any, exchangeRate: number): any {
  // DB stores price in USD. Convert to INR for the frontend.
  const basePriceInr = p.price * exchangeRate;
  const marginPercent = env.PRICE_MARKUP_PERCENTAGE || 30;
  
  // The actual selling price includes the platform margin
  const salePriceInr = basePriceInr * (1 + marginPercent / 100);
  
  // The 'original' struck-out price (e.g. showing a 20% discount visually)
  const originalPriceInr = salePriceInr * 1.20;
  
  return {
    _id: p.pid,
    cjProductId: p.pid,
    title: p.name,
    description: p.description || '',
    images: [p.image],
    brand: 'VoltEdge',
    price: Number(originalPriceInr.toFixed(2)),
    salePrice: Number(salePriceInr.toFixed(2)),
    discountPct: 20,
    stock: p.stock || 99,
    variants: [],
    category: p.categoryName || p.categoryId,
    tags: [],
    specifications: [],
    avgRating: p.rating || 4.5,
    reviewCount: p.reviewCount || 42,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isTrending: false,
  };
}

// ─── List products ────────────────────────────────────────────────────────────

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '20',
    sort,
    order,
    minPrice,
    maxPrice,
    keyword,
    category,
  } = req.query as Record<string, string | undefined>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  
  const exchangeRate = await currencyService.getUsdToInrRate();

  // Build MongoDB query
  const query: any = { isActive: true };

  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  if (category) {
    let catDoc;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      catDoc = await Category.findById(category);
    } else {
      catDoc = await Category.findOne({ slug: category });
    }
    
    if (catDoc) {
      query.categoryId = catDoc._id.toString();
    } else {
      query.categoryId = category;
    }
  }

  if (minPrice || maxPrice) {
    query.price = {};
    // Frontend sends filter in INR, DB stores in USD. Convert INR to USD for the query.
    if (minPrice) query.price.$gte = parseFloat(minPrice) / exchangeRate;
    if (maxPrice) query.price.$lte = parseFloat(maxPrice) / exchangeRate;
  }

  // Build MongoDB sort
  let sortObj: any = { createdAt: -1 };
  if (sort === 'salePrice') {
    sortObj = { price: order === 'asc' ? 1 : -1 };
  } else if (sort === 'avgRating' || sort === 'reviewCount') {
    sortObj = { rating: -1, reviewCount: -1 };
  }

  const [dbProducts, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
  ]);

  const products = dbProducts.map(p => mapToFrontendProduct(p, exchangeRate));

  const responseData = {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };

  res.json(ok('Products fetched', responseData));
});

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = '1', limit = '20' } = req.query as { q?: string; page?: string; limit?: string };

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters');
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;
  
  const exchangeRate = await currencyService.getUsdToInrRate();

  const query = {
    isActive: true,
    name: { $regex: q, $options: 'i' },
  };

  const [dbProducts, total] = await Promise.all([
    Product.find(query).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
  ]);

  const products = dbProducts.map(p => mapToFrontendProduct(p, exchangeRate));

  res.json(ok('Search results', {
    query: q,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: total,
      totalPages: Math.ceil(total / limitNum),
    },
  }));
});

export const autosuggest = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };

  if (!q || q.trim().length < 2) {
    return res.json(ok('Suggestions', { suggestions: [] }));
  }

  const exchangeRate = await currencyService.getUsdToInrRate();

  const dbProducts = await Product.find({
    isActive: true,
    name: { $regex: q, $options: 'i' },
  }).limit(8).lean();

  res.json(ok('Suggestions', {
    suggestions: dbProducts.map((p: any) => ({
      id: p.pid,
      title: p.name,
      image: p.image,
      price: Number((p.price * exchangeRate).toFixed(2)),
    })),
  }));
});

// ─── Single product ───────────────────────────────────────────────────────────

import { cjApiService } from '../services/cjApi.service';

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const dbProduct = await Product.findOne({ pid: id, isActive: true });
  if (!dbProduct) throw new ApiError(404, 'Product not found');

  try {
    // Fetch live data from CJ API to avoid price/stock collision
    const liveCjProduct = await cjApiService.getProductDetail(id);
    if (liveCjProduct) {
      // Update DB with the live rate/stock
      let updated = false;
      const livePrice = liveCjProduct.sellPrice;
      const liveStock = liveCjProduct.variants 
        ? liveCjProduct.variants.reduce((acc, v) => acc + (v.stock || 0), 0) 
        : undefined;

      if (livePrice && livePrice !== dbProduct.price) {
        dbProduct.price = livePrice;
        updated = true;
      }
      
      if (liveStock !== undefined && liveStock !== dbProduct.stock) {
        dbProduct.stock = liveStock;
        updated = true;
      }

      if (updated) {
        await dbProduct.save();
      }
    }
  } catch (err) {
    // Continue with the DB product if CJ fetch fails
    console.warn(`Failed to fetch live CJ product details for ${id}`, err);
  }

  const exchangeRate = await currencyService.getUsdToInrRate();
  const frontendProduct = mapToFrontendProduct(dbProduct.toObject(), exchangeRate);
  res.json(ok('Product fetched', frontendProduct));
});

// ─── Products by category ─────────────────────────────────────────────────────

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const {
    page = '1',
    limit = '20',
    sort,
    order,
    minPrice,
    maxPrice,
  } = req.query as Record<string, string | undefined>;

  const cat = await Category.findOne({ slug, isActive: true });
  if (!cat) throw new ApiError(404, `Category "${slug}" not found`);

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;
  
  const exchangeRate = await currencyService.getUsdToInrRate();

  const query: any = { isActive: true, categoryId: cat._id.toString() };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice) / exchangeRate;
    if (maxPrice) query.price.$lte = parseFloat(maxPrice) / exchangeRate;
  }

  let sortObj: any = { createdAt: -1 };
  if (sort === 'salePrice') {
    sortObj = { price: order === 'asc' ? 1 : -1 };
  } else if (sort === 'avgRating') {
    sortObj = { rating: -1 };
  }

  const [dbProducts, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(query),
  ]);

  const products = dbProducts.map(p => mapToFrontendProduct(p, exchangeRate));

  const responseData = {
    category: { id: cat._id, name: cat.name, slug: cat.slug, image: cat.image },
    products,
    pagination: {
      page: pageNum, 
      limit: limitNum, 
      total: total,
      totalPages: Math.ceil(total / limitNum),
    },
  };

  res.json(ok('Category products fetched', responseData));
});

// ─── All categories ───────────────────────────────────────────────────────────

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean();
  res.json(ok('Categories fetched', categories));
});

// ─── Sync Products ────────────────────────────────────────────────────────────

import { productSyncService } from '../services/productSync.service';

export const syncProducts = asyncHandler(async (_req: Request, res: Response) => {
  const result = await productSyncService.syncProductsFromCJ();
  res.json(ok('Products synced successfully', result));
});
