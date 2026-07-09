import { Request, Response } from 'express';
import { cjApiService } from '../services/cjApi.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { currencyService } from '../services/currency.service';
import { env } from '../config/env';
import { Banner } from '../models/Banner.model';

// ─── Public Endpoints ─────────────────────────────────────────────────────────

export const getBanners = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json(ok('Banners fetched', banners));
});

// Static categories fallback with valid MongoDB ObjectIds
const MOCK_CATEGORIES = [
  { _id: '64b1f1c5e4b0a1a2b3c4d5e1', id: '64b1f1c5e4b0a1a2b3c4d5e1', name: 'Accessories & Parts', slug: 'accessories-parts', image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800', isActive: true, cjKeyword: '30063684-45E2-4929-BB85-441C1DF80DDE' },
  { _id: '64b1f1c5e4b0a1a2b3c4d5e2', id: '64b1f1c5e4b0a1a2b3c4d5e2', name: 'Home Audio & Video', slug: 'home-audio-video', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800', isActive: true, cjKeyword: '4BFAF763-DD09-4DD3-A7E9-E03724D1D51B' },
  { _id: '64b1f1c5e4b0a1a2b3c4d5e3', id: '64b1f1c5e4b0a1a2b3c4d5e3', name: 'Smart Electronics', slug: 'smart-electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', isActive: true, cjKeyword: '6A03FBB1-F7D9-441F-B06D-EF45CA87B553' },
  { _id: '64b1f1c5e4b0a1a2b3c4d5e4', id: '64b1f1c5e4b0a1a2b3c4d5e4', name: 'Camera & Photo', slug: 'camera-photo', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', isActive: true, cjKeyword: '85E0D3B7-C3C4-4F1B-98A6-958389A1BEBE' },
  { _id: '64b1f1c5e4b0a1a2b3c4d5e5', id: '64b1f1c5e4b0a1a2b3c4d5e5', name: 'Video Games', slug: 'video-games', image: 'https://images.unsplash.com/photo-1600069226367-4dc4a8de47e4?w=800', isActive: true, cjKeyword: '997DBFF0-627C-4397-80D3-C12EA3906969' },
  { _id: '64b1f1c5e4b0a1a2b3c4d5e6', id: '64b1f1c5e4b0a1a2b3c4d5e6', name: 'Portable Audio & Video', slug: 'portable-audio-video', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', isActive: true, cjKeyword: 'DC11C779-CCD5-429C-9A93-F638456E745B' }
];

// Helper to map CJ Product to VoltEdge Frontend Product format
function mapToFrontendProduct(p: any, exchangeRate: number): any {
  // Convert price from USD to INR using the exchange rate
  const basePriceInr = p.sellPrice * exchangeRate;
  const marginPercent = env.PRICE_MARKUP_PERCENTAGE || 30;
  
  const salePriceInr = basePriceInr * (1 + marginPercent / 100);
  const originalPriceInr = salePriceInr * 1.20;
  
  return {
    _id: p.pid,
    cjProductId: p.pid,
    title: p.productName || p.productNameEn,
    description: p.description || '',
    images: p.productImages || [p.productImage],
    brand: 'VoltEdge',
    price: Number(originalPriceInr.toFixed(2)),
    salePrice: Number(salePriceInr.toFixed(2)),
    discountPct: 20,
    stock: p.variants ? p.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) : 99,
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      variantId: v.vid || v.variantId,
      name: v.variantName || v.name || 'Default',
    })),
    category: p.categoryName || p.categoryId,
    tags: p.materials || [],
    specifications: [],
    
    // No fake data!
    avgRating: 0,
    reviewCount: 0,
    
    status: 'active',
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
    trending,
    bestSeller,
    newArrival,
  } = req.query as Record<string, string | undefined>;

  let pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  
  // Make homepage sections visually distinct by offsetting the page number
  if (!category && !keyword) {
    if (trending === 'true') pageNum += 3;
    if (bestSeller === 'true') pageNum += 7;
    if (newArrival === 'true') pageNum += 12;
  }

  // Map MongoDB _id back to CJ Dropshipping categoryId
  let mappedCategoryId = category;
  if (category) {
    // We are inside the product.controller, so MOCK_CATEGORIES is accessible in this file
    const foundCat = MOCK_CATEGORIES.find(c => c._id === category || c.slug === category);
    if (foundCat) {
      mappedCategoryId = foundCat.cjKeyword;
    }
  }

  const params: any = {
    page: pageNum,
    limit: limitNum,
    keyword,
    categoryId: mappedCategoryId,
  };

  if (minPrice) params.minPrice = parseFloat(minPrice);
  if (maxPrice) params.maxPrice = parseFloat(maxPrice);
  
  if (sort) {
    if (sort === 'salePrice' || sort === 'price') {
      params.sortBy = order === 'asc' ? 'price_asc' : 'price_desc';
    } else if (sort !== 'createdAt') {
      params.sortBy = sort;
    }
  }

  const data = await cjApiService.getProductList(params);
  const exchangeRate = await currencyService.getUsdToInrRate();
  const products = data.list.map(p => mapToFrontendProduct(p, exchangeRate));

  const responseData = {
    products,
    pagination: {
      page: data.pageNum,
      limit: data.pageSize,
      total: data.total,
      totalPages: Math.ceil(data.total / data.pageSize),
      hasNext: data.pageNum < Math.ceil(data.total / data.pageSize),
      hasPrev: data.pageNum > 1,
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

  const data = await cjApiService.getProductList({ keyword: q, page: pageNum, limit: limitNum });
  const exchangeRate = await currencyService.getUsdToInrRate();
  const products = data.list.map(p => mapToFrontendProduct(p, exchangeRate));

  res.json(ok('Search results', {
    query: q,
    products,
    pagination: {
      page: data.pageNum,
      limit: data.pageSize,
      total: data.total,
      totalPages: Math.ceil(data.total / data.pageSize),
    },
  }));
});

export const autosuggest = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };

  if (!q || q.trim().length < 2) {
    return res.json(ok('Suggestions', { suggestions: [] }));
  }

  const data = await cjApiService.getProductList({ keyword: q, page: 1, limit: 8 });
  const exchangeRate = await currencyService.getUsdToInrRate();

  res.json(ok('Suggestions', {
    suggestions: data.list.map((p: any) => ({
      id: p.pid,
      title: p.productName || p.productNameEn,
      image: p.productImage,
      price: Number((p.sellPrice * exchangeRate * (1 + (env.PRICE_MARKUP_PERCENTAGE || 30) / 100)).toFixed(2)),
    })),
  }));
});

// ─── Single product ───────────────────────────────────────────────────────────

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const product = await cjApiService.getProductDetail(id);
  if (!product) throw new ApiError(404, 'Product not found');

  const exchangeRate = await currencyService.getUsdToInrRate();
  const frontendProduct = mapToFrontendProduct(product, exchangeRate);
  res.json(ok('Product fetched', frontendProduct));
});

// ─── Products by category (using Static Mock) ─────────

export const getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };
  const { page = '1', limit = '20', sort, order, minPrice, maxPrice } = req.query as Record<string, string | undefined>;

  const cat = MOCK_CATEGORIES.find(c => c.slug === slug);
  if (!cat) throw new ApiError(404, `Category "${slug}" not found`);

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));

  const params: any = {
    page: pageNum,
    limit: limitNum,
    categoryId: cat.cjKeyword || cat._id, 
  };

  if (minPrice) params.minPrice = parseFloat(minPrice);
  if (maxPrice) params.maxPrice = parseFloat(maxPrice);
  if (sort === 'salePrice') {
    params.sortBy = order === 'asc' ? 'price_asc' : 'price_desc';
  }

  const data = await cjApiService.getProductList(params);
  const exchangeRate = await currencyService.getUsdToInrRate();
  const products = data.list.map(p => mapToFrontendProduct(p, exchangeRate));

  const responseData = {
    category: { id: cat._id, name: cat.name, slug: cat.slug, image: cat.image },
    products,
    pagination: {
      page: data.pageNum,
      limit: data.pageSize,
      total: data.total,
      totalPages: Math.ceil(data.total / data.pageSize),
      hasNext: data.pageNum < Math.ceil(data.total / data.pageSize),
      hasPrev: data.pageNum > 1,
    },
  };

  res.json(ok('Category products fetched', responseData));
});

// ─── All categories ───────────────────────────────────────────────────────────

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok('Categories fetched', MOCK_CATEGORIES));
});

// ─── Sync Products (Deprecated/Removed) ───────────────────────────────────────

export const syncProducts = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok('Sync is no longer necessary as products are fetched dynamically from CJ/Redis.', {}));
});
