import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  CJProduct,
  CJProductListResponse,
  CJOrderPayload,
  CJItemFulfillment,
  CJTrackingInfo,
  CJVariant,
  CJFreightOption,
  CJFreightRequest,
  CJCategoryFirst,
  CJHomeCategory,
} from '../types';
import { redisService } from './redis.service';
import { cjAuthService } from './cjAuth.service';

const MOCK_PRODUCTS: CJProduct[] = [
  {
    pid: 'CJMOCK001',
    productName: 'Modern L-Shaped Sectional Sofa',
    productNameEn: 'Modern L-Shaped Sectional Sofa',
    productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    sellPrice: 450,
    categoryId: 'CAT_FURNITURE_SOFA',
    categoryName: 'Sofas & Couches',
    description: 'Premium velvet upholstery with solid wood frame. Perfect for modern living rooms.',
    productWeight: 85,
    variants: [
      {
        vid: 'CJMOCK001-V1',
        variantName: 'Gray Velvet',
        variantSellPrice: 450,
        variantSku: 'SOFA-GRAY-L',
        stock: 50,
      },
      {
        vid: 'CJMOCK001-V2',
        variantName: 'Navy Blue Velvet',
        variantSellPrice: 470,
        variantSku: 'SOFA-NAVY-L',
        stock: 30,
      },
    ],
  },
  {
    pid: 'CJMOCK002',
    productName: 'Oak Wood Dining Table Set (6 Chairs)',
    productNameEn: 'Oak Wood Dining Table Set',
    productImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    sellPrice: 680,
    categoryId: 'CAT_FURNITURE_DINING',
    categoryName: 'Dining Tables',
    description: 'Solid oak dining table with 6 upholstered chairs. Seats up to 6 people.',
    productWeight: 120,
    variants: [
      {
        vid: 'CJMOCK002-V1',
        variantName: 'Natural Oak',
        variantSellPrice: 680,
        variantSku: 'DINE-OAK-6',
        stock: 25,
      },
    ],
  },
  {
    pid: 'CJMOCK003',
    productName: 'Ergonomic Executive Office Chair',
    productNameEn: 'Ergonomic Executive Office Chair',
    productImage: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
    sellPrice: 220,
    categoryId: 'CAT_FURNITURE_OFFICE',
    categoryName: 'Office Chairs',
    description: 'High-back ergonomic chair with lumbar support and adjustable armrests.',
    productWeight: 18,
    variants: [
      {
        vid: 'CJMOCK003-V1',
        variantName: 'Black Mesh',
        variantSellPrice: 220,
        variantSku: 'CHAIR-BLK-M',
        stock: 100,
      },
      {
        vid: 'CJMOCK003-V2',
        variantName: 'White Leather',
        variantSellPrice: 260,
        variantSku: 'CHAIR-WHT-L',
        stock: 60,
      },
    ],
  },
  {
    pid: 'CJMOCK004',
    productName: 'King Size Platform Bed Frame',
    productNameEn: 'King Size Platform Bed Frame',
    productImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    sellPrice: 520,
    categoryId: 'CAT_FURNITURE_BED',
    categoryName: 'Beds & Frames',
    description: 'Minimalist platform bed with built-in headboard storage. No box spring needed.',
    productWeight: 65,
    variants: [
      {
        vid: 'CJMOCK004-V1',
        variantName: 'Walnut Finish',
        variantSellPrice: 520,
        variantSku: 'BED-KING-WAL',
        stock: 40,
      },
    ],
  },
  {
    pid: 'CJMOCK005',
    productName: 'Industrial Bookshelf Unit (5-Tier)',
    productNameEn: 'Industrial Bookshelf Unit',
    productImage: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
    sellPrice: 180,
    categoryId: 'CAT_FURNITURE_STORAGE',
    categoryName: 'Shelving & Storage',
    description: 'Metal and wood industrial style bookshelf. Easy assembly.',
    productWeight: 35,
    variants: [
      {
        vid: 'CJMOCK005-V1',
        variantName: 'Black Metal / Brown Wood',
        variantSellPrice: 180,
        variantSku: 'SHELF-5T-BB',
        stock: 80,
      },
    ],
  },
];

const MOCK_CATEGORY_TREE: CJCategoryFirst[] = [
  {
    categoryFirstId: '52FC6CA5-669B-4D0B-B1AC-415675931399',
    categoryFirstName: 'Home, Garden & Furniture',
    categoryFirstList: [
      {
        categorySecondId: 'MOCK-SECOND-SOFA',
        categorySecondName: 'Sofas & Couches',
        categorySecondList: [
          { categoryId: 'CAT_FURNITURE_SOFA', categoryName: 'Sofas & Couches' },
        ],
      },
      {
        categorySecondId: 'MOCK-SECOND-DINING',
        categorySecondName: 'Dining Furniture',
        categorySecondList: [
          { categoryId: 'CAT_FURNITURE_DINING', categoryName: 'Dining Tables' },
        ],
      },
      {
        categorySecondId: 'MOCK-SECOND-OFFICE',
        categorySecondName: 'Office Furniture',
        categorySecondList: [
          { categoryId: 'CAT_FURNITURE_OFFICE', categoryName: 'Office Chairs' },
        ],
      },
      {
        categorySecondId: 'MOCK-SECOND-BED',
        categorySecondName: 'Bedroom Furniture',
        categorySecondList: [
          { categoryId: 'CAT_FURNITURE_BED', categoryName: 'Beds & Frames' },
        ],
      },
      {
        categorySecondId: 'MOCK-SECOND-STORAGE',
        categorySecondName: 'Storage & Shelving',
        categorySecondList: [
          { categoryId: 'CAT_FURNITURE_STORAGE', categoryName: 'Shelving & Storage' },
        ],
      },
      {
        categorySecondId: 'MOCK-SECOND-GARDEN',
        categorySecondName: 'Garden Furniture',
        categorySecondList: [
          { categoryId: 'MOCK-GARDEN-SET', categoryName: 'Garden Sets' },
        ],
      },
    ],
  },
];

function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest' | 'popular' | 'rating';
}

interface CJApiResponse<T> {
  code: number;
  result: boolean;
  message?: string;
  data: T;
}

interface CJListV1Response {
  list: Array<Record<string, unknown>>;
  total: number;
  pageNum: number;
  pageSize: number;
}

interface CJListV2Product {
  id: string;
  nameEn: string;
  bigImage: string;
  sellPrice: string | number;
  categoryId: string;
  threeCategoryName?: string;
  description?: string;
  productWeight?: number;
}

interface CJListV2Response {
  content: Array<{ productList: CJListV2Product[] }>;
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

interface CJProductDetailRaw {
  pid: string;
  productName?: string;
  productNameEn?: string;
  productSku?: string;
  bigImage?: string;
  productImage?: string;
  productImageSet?: string[];
  productImages?: string[];
  productWeight?: string | number;
  productLength?: string | number;
  productWidth?: string | number;
  productHeight?: string | number;
  packMaterial?: string;
  packingName?: string;
  packingNameEn?: string;
  materialName?: string;
  materialNameEn?: string;
  sellPrice?: string | number;
  suggestSellPrice?: string | number;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  variants?: Array<Record<string, unknown>>;
}

interface CJFreightRaw {
  logisticName?: string;
  logisticPrice?: number;
  logisticPriceCn?: number;
  logisticAging?: string;
}

interface CJTrackingRaw {
  trackingNumber?: string;
  logisticName?: string;
  trackingStatus?: string;
  trackingList?: Array<{
    date?: string;
    activity?: string;
    location?: string;
  }>;
}

function normalizeProductTitle(name?: string): string {
  return (name ?? '').replace(/\s+/g, ' ').trim();
}

function parseJsonStringArray(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // plain string
  }
  const trimmed = value.trim();
  return trimmed ? [trimmed] : [];
}

function parseCategoryLeafName(value?: string): string {
  if (!value?.trim()) return '';
  const parts = value.split('/').map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? value.trim();
}

function parseProductImages(raw: CJProductDetailRaw): string[] {
  if (Array.isArray(raw.productImageSet) && raw.productImageSet.length > 0) {
    return [...new Set(raw.productImageSet.map(String).filter(Boolean))];
  }

  const fromProductImage = parseJsonStringArray(raw.productImage);
  if (fromProductImage.length > 0) {
    return [...new Set(fromProductImage)];
  }

  if (Array.isArray(raw.productImages) && raw.productImages.length > 0) {
    return [...new Set(raw.productImages.map(String).filter(Boolean))];
  }

  if (raw.bigImage) return [String(raw.bigImage)];
  return [];
}

/** CJ variant dimensions are typically in mm; convert to cm for display. */
function variantDimensionToCm(value: string | number | undefined): number | undefined {
  const num = toNumber(value);
  if (num <= 0) return undefined;
  return Number((num / 10).toFixed(1));
}

function parseMaterialField(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const items = parseJsonStringArray(value);
  if (items.length > 0) return items.join(', ');
  return value.trim();
}

function parseProductName(name?: string, nameEn?: string): string {
  if (nameEn?.trim()) return normalizeProductTitle(nameEn);
  if (!name) return '';
  const items = parseJsonStringArray(name);
  if (items.length > 0) return normalizeProductTitle(items.join(' '));
  return normalizeProductTitle(name);
}

function toNumber(value: string | number | undefined, fallback = 0): number {
  if (value === undefined || value === null) return fallback;
  const num = parseFloat(String(value));
  return Number.isFinite(num) ? num : fallback;
}

function mapVariant(raw: Record<string, unknown>): CJVariant {
  const inventories = raw.inventories as Array<{ totalInventory?: number }> | undefined;
  const inventoryStock = inventories?.reduce((sum, inv) => sum + (inv.totalInventory ?? 0), 0);
  const stock =
    inventoryStock && inventoryStock > 0
      ? inventoryStock
      : raw.inventoryNum != null
        ? toNumber(raw.inventoryNum as string | number)
        : 99;

  const variantName = normalizeProductTitle(
    String(raw.variantNameEn ?? raw.variantName ?? raw.variantKey ?? raw.variantSku ?? 'Default')
  );

  return {
    vid: String(raw.vid ?? ''),
    variantName,
    variantImage: raw.variantImage ? String(raw.variantImage) : undefined,
    variantSellPrice: toNumber(raw.variantSellPrice as string | number | undefined),
    variantSku: raw.variantSku ? String(raw.variantSku) : undefined,
    stock,
  };
}

function mapListV1Product(raw: Record<string, unknown>): CJProduct {
  const productName = parseProductName(String(raw.productName ?? ''));
  const productNameEn = String(raw.productNameEn ?? productName);
  const weight = raw.productWeight !== undefined ? toNumber(raw.productWeight as string | number) : undefined;
  const images = parseProductImages(raw as unknown as CJProductDetailRaw);

  return {
    pid: String(raw.pid ?? ''),
    productName: productNameEn || productName,
    productNameEn: productNameEn || productName,
    productImage: images[0] ?? String(raw.bigImage ?? ''),
    productImages: images.length > 1 ? images : undefined,
    sellPrice: toNumber(raw.sellPrice as string | number | undefined),
    categoryId: String(raw.categoryId ?? ''),
    categoryName: parseCategoryLeafName(String(raw.categoryName ?? '')),
    ...(weight !== undefined && { productWeight: weight }),
  };
}

function mapListV2Product(raw: CJListV2Product): CJProduct {
  return {
    pid: raw.id,
    productName: raw.nameEn,
    productNameEn: raw.nameEn,
    productImage: raw.bigImage,
    sellPrice: toNumber(raw.sellPrice),
    categoryId: raw.categoryId,
    categoryName: parseCategoryLeafName(raw.threeCategoryName ?? ''),
    description: raw.description,
    productWeight: raw.productWeight,
  };
}

function extractMaterials(description?: string, packMaterial?: string, materialName?: string): string[] {
  const materials = new Set<string>();
  const sources = [packMaterial, materialName, description].filter(Boolean).join(' ').toLowerCase();

  const keywords = [
    'wood',
    'oak',
    'walnut',
    'pine',
    'metal',
    'steel',
    'iron',
    'leather',
    'fabric',
    'velvet',
    'linen',
    'glass',
    'marble',
    'plastic',
    'rattan',
    'bamboo',
    'mdf',
    'particle board',
  ];

  for (const keyword of keywords) {
    if (sources.includes(keyword)) {
      materials.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  if (packMaterial) materials.add(packMaterial);
  if (materialName) materials.add(materialName);

  return Array.from(materials).slice(0, 5);
}

function mapProductDetail(raw: CJProductDetailRaw): CJProduct {
  const productNameEn = normalizeProductTitle(raw.productNameEn ?? '');
  const productName = parseProductName(raw.productName, productNameEn);
  const images = parseProductImages(raw);
  const mainImage = images[0] ?? String(raw.bigImage ?? '');
  const extraImages = images.filter((img) => img !== mainImage);

  const firstVariant = raw.variants?.[0] as Record<string, unknown> | undefined;
  const length =
    raw.productLength !== undefined
      ? toNumber(raw.productLength)
      : variantDimensionToCm(firstVariant?.variantLength as string | number | undefined);
  const width =
    raw.productWidth !== undefined
      ? toNumber(raw.productWidth)
      : variantDimensionToCm(firstVariant?.variantWidth as string | number | undefined);
  const height =
    raw.productHeight !== undefined
      ? toNumber(raw.productHeight)
      : variantDimensionToCm(firstVariant?.variantHeight as string | number | undefined);

  const materialEn = parseMaterialField(raw.materialNameEn);
  const materialLocal = parseMaterialField(raw.materialName);
  const parsedMaterial = materialEn ?? materialLocal;
  const packingNames = parseJsonStringArray(raw.packingNameEn ?? raw.packingName);
  const packMaterial = packingNames.join(', ') || raw.packMaterial;
  const materials = extractMaterials(raw.description, packMaterial, parsedMaterial);
  const variants = raw.variants?.map((v) => mapVariant(v));
  const variantPrices = (variants ?? [])
    .map((v) => v.variantSellPrice)
    .filter((price) => price > 0);
  const sellPrice =
    toNumber(raw.sellPrice) > 0
      ? toNumber(raw.sellPrice)
      : variantPrices.length > 0
        ? Math.min(...variantPrices)
        : 0;
  const sourcePrice = toNumber(raw.suggestSellPrice) || undefined;

  return {
    pid: raw.pid,
    productName: productNameEn || productName,
    productNameEn: productNameEn || productName,
    productImage: mainImage,
    productImages: mainImage ? [mainImage, ...extraImages] : extraImages,
    productWeight: toNumber(raw.productWeight),
    sellPrice,
    sourcePrice,
    categoryId: raw.categoryId ?? '',
    categoryName: parseCategoryLeafName(raw.categoryName),
    description: raw.description,
    packMaterial,
    materials,
    dimensions:
      length || width || height
        ? { length, width, height, unit: 'cm' }
        : undefined,
    variants,
  };
}

class CjApiService {
  private baseUrl = env.CJ_API_BASE_URL;
  private useMock = env.CJ_MOCK_MODE || !cjAuthService.isConfigured();
  private rateLimitChain: Promise<void> = Promise.resolve();
  private lastRequestEndedAt = 0;

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async waitForRateLimit(): Promise<void> {
    const minIntervalMs = env.CJ_API_MIN_INTERVAL_MS;
    if (this.lastRequestEndedAt > 0) {
      const elapsed = Date.now() - this.lastRequestEndedAt;
      const waitMs = minIntervalMs - elapsed;
      if (waitMs > 0) await this.sleep(waitMs);
    }
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuth = true
  ): Promise<T> {
    await this.waitForRateLimit();

    try {
      const accessToken = await cjAuthService.getAccessToken();
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': accessToken,
          ...options.headers,
        },
      });

      if (response.status === 401 && retryOnAuth) {
        logger.warn('CJ API returned 401, refreshing token and retrying', { endpoint });
        await cjAuthService.invalidateToken();
        return this.request<T>(endpoint, options, false);
      }

      const json = (await response.json()) as CJApiResponse<T>;

      if (!response.ok || !json.result) {
        logger.error('CJ API error', {
          endpoint,
          status: response.status,
          message: json.message,
        });
        throw new Error(json.message ?? `CJ API error: ${response.status}`);
      }

      return json.data;
    } finally {
      this.lastRequestEndedAt = Date.now();
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuth = true
  ): Promise<T> {
    if (this.useMock) {
      throw new Error('MOCK_MODE');
    }

    const result = this.rateLimitChain.then(() =>
      this.executeRequest<T>(endpoint, options, retryOnAuth)
    );
    this.rateLimitChain = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  private filterMockProducts(params: ProductListParams): CJProduct[] {
    let products = [...MOCK_PRODUCTS];

    if (params.categoryId) {
      products = products.filter((p) => p.categoryId === params.categoryId);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      products = products.filter(
        (p) =>
          p.productName.toLowerCase().includes(kw) ||
          p.categoryName.toLowerCase().includes(kw)
      );
    }
    if (params.minPrice !== undefined) {
      products = products.filter((p) => p.sellPrice >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      products = products.filter((p) => p.sellPrice <= params.maxPrice!);
    }

    if (params.sortBy === 'price_asc') {
      products.sort((a, b) => a.sellPrice - b.sellPrice);
    } else if (params.sortBy === 'price_desc' || params.sortBy === 'popular') {
      products.sort((a, b) => b.sellPrice - a.sellPrice);
    } else if (params.sortBy === 'name') {
      products.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (params.sortBy === 'newest') {
      products.reverse();
    } else if (params.sortBy === 'rating') {
      products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    if (params.material) {
      const material = params.material.toLowerCase();
      products = products.filter((p) =>
        (p.materials ?? []).some((m) => m.toLowerCase().includes(material)) ||
        (p.description ?? '').toLowerCase().includes(material) ||
        (p.packMaterial ?? '').toLowerCase().includes(material)
      );
    }

    if (params.minRating !== undefined) {
      products = products.filter((p) => (p.rating ?? 0) >= params.minRating!);
    }

    return products;
  }

  private mockProductList(params: ProductListParams): CJProductListResponse {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const filtered = this.filterMockProducts(params);
    const start = (page - 1) * limit;

    return {
      list: filtered.slice(start, start + limit),
      total: filtered.length,
      pageNum: page,
      pageSize: limit,
    };
  }

  private buildListV2Query(params: ProductListParams, page: number, limit: number): URLSearchParams {
    const query = new URLSearchParams({
      page: String(page),
      size: String(limit),
    });

    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.keyword) query.set('keyWord', params.keyword);
    if (params.minPrice !== undefined) query.set('startSellPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('endSellPrice', String(params.maxPrice));

    if (params.sortBy === 'price_asc') {
      query.set('orderBy', '2');
      query.set('sort', 'asc');
    
    } else if (params.sortBy === 'price_desc') {
      query.set('orderBy', '2');
      query.set('sort', 'desc');
    
    } else if (params.sortBy === 'name') {
      query.set('orderBy', '0');
      query.set('sort', 'desc');
    
    } else if (params.sortBy === 'newest') {
      query.set('orderBy', '3');
      query.set('sort', 'desc');
    
    } else if (params.sortBy === 'popular') {
      query.set('orderBy', '1');
      query.set('sort', 'desc');
    
    } else if (params.sortBy === 'rating') {
      // CJ does NOT support rating.
      // Fallback to Best Match (or Popular if you prefer).
      query.set('orderBy', '0');
      query.set('sort', 'desc');
    }

    return query;
  }

  private buildListV1Query(params: ProductListParams, page: number, limit: number): URLSearchParams {
    const query = new URLSearchParams({
      pageNum: String(page),
      pageSize: String(limit),
    });

    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.keyword) query.set('productNameEn', params.keyword);
    if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));

    return query;
  }

  private async fetchProductList(params: ProductListParams): Promise<CJProductListResponse> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const keyword = params.keyword?.trim();
    const resolvedParams = { ...params, page, limit, keyword };
    const useV2 = Boolean(
      resolvedParams.keyword ||
        resolvedParams.sortBy ||
        resolvedParams.minPrice !== undefined ||
        resolvedParams.maxPrice !== undefined
    );

    if (useV2) {
      const query = this.buildListV2Query(resolvedParams, page, limit);
      console.log(query.toString(),"qu----------------ery",resolvedParams.sortBy);
      const data = await this.request<any>(`/product/listV2?${query}`);
      
      let rawList: CJListV2Product[] = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data?.content && Array.isArray(data.content)) {
        rawList = data.content.flatMap((group: any) => group.productList || []);
      }
      
      const list = rawList.map(mapListV2Product);

      return {
        list,
        total: (data && data.totalRecords) ? data.totalRecords : list.length,
        pageNum: (data && data.pageNumber) ? data.pageNumber : page,
        pageSize: (data && data.pageSize) ? data.pageSize : limit,
      };
    }

    const query = this.buildListV1Query(resolvedParams, page, limit);
    const data = await this.request<CJListV1Response>(`/product/list?${query}`);

    return {
      list: (data.list ?? []).map(mapListV1Product),
      total: data.total ?? 0,
      pageNum: data.pageNum ?? page,
      pageSize: data.pageSize ?? limit,
    };
  }

  async getProductList(params: ProductListParams = {}): Promise<CJProductListResponse> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const keyword = params.keyword?.trim();
    const resolvedParams = { ...params, page, limit, keyword };
    const filterKey = JSON.stringify(resolvedParams);
    const cacheKey = redisService.productListKey(page, limit, filterKey);
    const cached = await redisService.get<CJProductListResponse>(cacheKey);
    if (cached) return cached;
    let result: CJProductListResponse;

    if (this.useMock) {
      result = this.mockProductList(resolvedParams);
    } else {
      try {
        logger.info('CJ product list fetch started', { keyword });
        result = await this.fetchProductList(resolvedParams);
      } catch (err) {
        logger.warn('CJ product list fetch failed, falling back to mock data', {
          error: (err as Error).message,
          keyword,
        });
        result = this.mockProductList(resolvedParams);
      }
    }

    await redisService.set(cacheKey, result, redisService.getProductTtl());
    return result;
  }

  async getProductDetail(pid: string): Promise<CJProduct | null> {
    const cacheKey = redisService.productDetailKey(pid);
    const cached = await redisService.get<CJProduct>(cacheKey);
    if (cached) return cached;

    let product: CJProduct | null = null;

    if (this.useMock) {
      product = MOCK_PRODUCTS.find((p) => p.pid === pid) ?? null;
    } else {
      const raw = await this.request<CJProductDetailRaw>(`/product/query?pid=${encodeURIComponent(pid)}`);
      product = mapProductDetail(raw);
    }

    if (product) {
      await redisService.set(cacheKey, product, redisService.getProductTtl());
    }
    return product;
  }

  async searchProducts(keyword: string, page = 1, limit = 20): Promise<CJProductListResponse> {
    return this.getProductList({ keyword, page, limit });
  }

  async findProductBySlug(slug: string): Promise<CJProduct | null> {
    const normalized = slug.toLowerCase();

    if (this.useMock) {
      return (
        MOCK_PRODUCTS.find(
          (p) =>
            p.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ===
            normalized
        ) ?? null
      );
    }

    const keyword = normalized.replace(/-/g, ' ');
    const result = await this.getProductList({ keyword, page: 1, limit: 20 });
    return (
      result.list.find(
        (p) =>
          p.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ===
          normalized
      ) ??
      result.list[0] ??
      null
    );
  }

  async resolveItemFulfillment(pid: string, vid: string): Promise<CJItemFulfillment> {
    if (this.useMock) {
      const product = MOCK_PRODUCTS.find((p) => p.pid === pid);
      const variant =
        product?.variants?.find((v) => v.vid === vid && vid !== 'default') ??
        product?.variants?.[0];
      return {
        vid: variant?.vid ?? (vid === 'default' ? pid : vid),
        warehouseCountryCode: env.CJ_FROM_COUNTRY_CODE,
        availableQty: variant?.stock ?? 999,
      };
    }

    const raw = await this.request<CJProductDetailRaw>(
      `/product/query?pid=${encodeURIComponent(pid)}`
    );
    const variants = raw.variants ?? [];
    if (variants.length === 0) {
      throw new Error(`No variants found for product ${pid}`);
    }

    let variant =
      vid && vid !== 'default'
        ? variants.find((v) => String(v.vid) === vid)
        : undefined;

    if (!variant) {
      variant =
        variants.find((v) => {
          const inventories = v.inventories as Array<{ totalInventory?: number }> | undefined;
          return inventories?.some((inv) => (inv.totalInventory ?? 0) > 0);
        }) ?? variants[0];
    }

    const resolvedVid = String(variant.vid ?? '');
    if (!resolvedVid) {
      throw new Error(`Could not resolve variant for product ${pid}`);
    }

    const inventories =
      (variant.inventories as Array<{ countryCode?: string; totalInventory?: number }>) ?? [];
    const bestInventory = inventories.reduce(
      (best, inv) =>
        (inv.totalInventory ?? 0) > (best?.totalInventory ?? 0) ? inv : best,
      inventories[0]
    );

    return {
      vid: resolvedVid,
      warehouseCountryCode: bestInventory?.countryCode ?? env.CJ_FROM_COUNTRY_CODE,
      availableQty: bestInventory?.totalInventory ?? 0,
    };
  }

  async createOrder(payload: CJOrderPayload): Promise<{ orderId: string; orderNumber: string }> {
    if (this.useMock) {
      logger.info('CJ mock order created', { orderNumber: payload.orderNumber });
      return {
        orderId: `CJ-MOCK-${Date.now()}`,
        orderNumber: payload.orderNumber,
      };
    }

    const logisticName = payload.logisticName ?? env.CJ_LOGISTIC_NAME;
    const fromCountryCode = payload.fromCountryCode ?? env.CJ_FROM_COUNTRY_CODE;

    const orderBody: Record<string, unknown> = {
      isSandbox: env.SANDBOX_MODE ? 1 : 0,
      orderNumber: payload.orderNumber,
      shippingZip: payload.shippingZip,
      shippingCountryCode: payload.shippingCountryCode,
      shippingCountry: payload.shippingCountry,
      shippingProvince: payload.shippingProvince,
      shippingCity: payload.shippingCity,
      shippingAddress: payload.shippingAddress,
      shippingCustomerName: payload.shippingCustomerName,
      shippingPhone: payload.shippingPhone,
      logisticName,
      fromCountryCode,
      platform: 'Api',
      orderFlow: 1,
      products: payload.products,
    };

    logger.info('CJ createOrderV2 payload', {
      orderNumber: payload.orderNumber,
      fromCountryCode,
      logisticName,
      products: payload.products,
    });

    if (env.CJ_ORDER_PAY_TYPE !== undefined) {
      orderBody.payType = env.CJ_ORDER_PAY_TYPE;
    }

    const data = await this.request<{ orderId: string; orderNumber: string }>(
      '/shopping/order/createOrderV2',
      {
        method: 'POST',
        body: JSON.stringify(orderBody),
      }
    );

    return {
      orderId: data.orderId,
      orderNumber: data.orderNumber ?? payload.orderNumber,
    };
  }

  async calculateFreight(request: CJFreightRequest): Promise<CJFreightOption[]> {
    if (this.useMock) {
      const baseCost = request.products.reduce((sum, p) => sum + p.quantity * 8, 0);
      return [
        {
          id: 'standard',
          name: 'Standard Shipping',
          cost: Number(baseCost.toFixed(2)),
          days: '7-14',
          carrier: 'Mock Logistics',
        },
        {
          id: 'express',
          name: 'Express Shipping',
          cost: Number((baseCost * 1.6 + 12).toFixed(2)),
          days: '3-7',
          carrier: 'Mock Express',
        },
      ];
    }

    const body: Record<string, unknown> = {
      startCountryCode: request.startCountryCode,
      endCountryCode: request.endCountryCode,
      products: request.products,
    };
    if (request.zip) body.zip = request.zip;

    const data = await this.request<CJFreightRaw[]>(
      '/logistic/freightCalculate',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
        
    return (data ?? []).map((option, index) => ({
      id: `${option.logisticName ?? 'shipping'}-${index}`,
      name: option.logisticName ?? 'Shipping',
      cost: Number(option.logisticPrice ?? option.logisticPriceCn ?? 0),
      days: option.logisticAging ?? '7-14',
      carrier: option.logisticName,
    }));
  }

  async getTracking(trackingNumber: string): Promise<CJTrackingInfo> {
    if (this.useMock) {
      return {
        trackingNumber,
        carrier: 'Mock Logistics',
        status: 'In Transit',
        events: [
          {
            date: new Date().toISOString(),
            description: 'Package picked up',
            location: 'Shenzhen, CN',
          },
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            description: 'Order processed',
            location: 'Warehouse',
          },
        ],
      };
    }

    const data = await this.request<CJTrackingRaw | CJTrackingRaw[]>(
      `/logistic/trackInfo?trackNumber=${encodeURIComponent(trackingNumber)}`
    );

    const tracking = Array.isArray(data) ? data[0] : data;
    if (!tracking) {
      throw new Error('Tracking information not found');
    }

    return {
      trackingNumber: tracking.trackingNumber ?? trackingNumber,
      carrier: tracking.logisticName ?? 'Unknown',
      status: tracking.trackingStatus ?? 'Unknown',
      events: (tracking.trackingList ?? []).map((event) => ({
        date: event.date ?? '',
        description: event.activity ?? '',
        location: event.location,
      })),
    };
  }

  isMockMode(): boolean {
    return this.useMock;
  }

  async getCategoryTree(): Promise<CJCategoryFirst[]> {
    const cacheKey = redisService.categoryTreeKey();
    const cached = await redisService.get<CJCategoryFirst[]>(cacheKey);
    if (cached) return cached;

    let tree: CJCategoryFirst[];
    if (this.useMock) {
      tree = MOCK_CATEGORY_TREE;
    } else {
      tree = await this.request<CJCategoryFirst[]>('/product/getCategory');
    }

    await redisService.set(cacheKey, tree, redisService.getCategoryTtl());
    return tree;
  }

  async getHomeCategories(): Promise<CJHomeCategory[]> {
    const firstId = env.CJ_HOME_CATEGORY_FIRST_ID;
    const firstName = env.CJ_HOME_CATEGORY_FIRST_NAME;
    const cacheKey = redisService.categoryHomeKey(firstId);
    const cached = await redisService.get<CJHomeCategory[]>(cacheKey);
    if (cached) return cached;

    const tree = await this.getCategoryTree();
    const firstCategory = tree.find(
      (item) =>
        item.categoryFirstId?.toLowerCase() === firstId.toLowerCase() ||
        item.categoryFirstName === firstName
    );

    if (!firstCategory?.categoryFirstList?.length) {
      logger.warn('CJ home category group not found', { firstId, firstName });
      return [];
    }

    const resolvedFirstId = firstCategory.categoryFirstId ?? firstId;
    const homeCategories: CJHomeCategory[] = [];

    for (const second of firstCategory.categoryFirstList) {
      for (const third of second.categorySecondList ?? []) {
        if (!third.categoryId || !third.categoryName) continue;

        homeCategories.push({
          id: third.categoryId,
          name: third.categoryName,
          slug: slugifyCategoryName(third.categoryName),
          cjCategoryId: third.categoryId,
          categorySecondId: second.categorySecondId,
          categorySecondName: second.categorySecondName,
          categoryFirstId: resolvedFirstId,
          categoryFirstName: firstCategory.categoryFirstName,
        });
      }
    }

    homeCategories.sort((a, b) => a.name.localeCompare(b.name));
    await redisService.set(cacheKey, homeCategories, redisService.getCategoryTtl());
    return homeCategories;
  }
}

export const cjApiService = new CjApiService();
