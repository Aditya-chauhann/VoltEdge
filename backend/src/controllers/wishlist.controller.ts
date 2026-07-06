/**
 * Wishlist Controller
 * Toggles products in/out of the user's wishlist.
 */

import { Response } from 'express';
import { User } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { cjApiService } from '../services/cjApi.service';
import { pricingService } from '../services/pricing.service';

import { currencyService } from '../services/currency.service';

function mapToFrontendProduct(p: any, rate: number): any {
  const images = p.productImages && p.productImages.length > 0 
    ? p.productImages 
    : (p.productImage ? [p.productImage] : []);
  
  const basePrice = Number((p.sellPrice * rate).toFixed(2));
  
  return {
    _id: p.pid,
    cjProductId: p.pid,
    title: p.productName || p.productNameEn,
    images,
    price: Number((basePrice * 1.2).toFixed(2)),
    salePrice: basePrice,
    status: 'active',
  };
}

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) throw new ApiError(404, 'User not found');

  const products = [];
  const rate = await currencyService.getUsdToInrRate();
  
  for (const pid of user.wishlist) {
    try {
      const product = await cjApiService.getProductDetail(pid);
      if (product) {
        const priced = await pricingService.applyPricingToProductDetail(product as any);
        products.push(mapToFrontendProduct(priced, rate));
      }
    } catch (err) {
      // ignore missing product
    }
  }

  res.json(ok('Wishlist fetched', products));
});

export const toggleWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params as { productId: string };

  const product = await cjApiService.getProductDetail(productId);
  if (!product) throw new ApiError(404, 'Product not found on CJ Dropshipping');

  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  const idx = user.wishlist.indexOf(productId);

  let action: 'added' | 'removed';
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
    action = 'removed';
  } else {
    user.wishlist.push(productId);
    action = 'added';
  }

  await user.save();

  res.json(ok(`Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`, {
    action,
    productId,
    wishlistCount: user.wishlist.length,
  }));
});

