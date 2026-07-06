/**
 * Cart Controller
 * Server-side cart persisted in MongoDB.
 * Cart is locked when checkout begins; unlocked on completion/cancellation.
 */

import { Response } from 'express';
import { Cart } from '../models/Cart.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { cjApiService } from '../services/cjApi.service';
import { pricingService } from '../services/pricing.service';
import { currencyService } from '../services/currency.service';

// Ensure the user has a cart document; create one if missing
async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const rate = await currencyService.getUsdToInrRate();

  // Enrich cart items with latest product data from CJ API
  const enrichedItems = await Promise.all(cart.items.map(async (item: any) => {
    let obj = item.toObject ? item.toObject() : item;
    
    // Always convert priceSnapshot to INR for frontend display
    obj = {
      ...obj,
      priceSnapshot: Number((obj.priceSnapshot * rate).toFixed(2))
    };

    try {
      const product = await cjApiService.getProductDetail(item.productId);
      if (product) {
        const priced = await pricingService.applyPricingToProductDetail(product as any);
        const images = product.productImages?.length ? product.productImages : (product.productImage ? [product.productImage] : []);
        
        let variantInfo = undefined;
        if (item.variantId && priced.variants) {
          variantInfo = priced.variants.find((v: any) => v.vid === item.variantId);
        }

        return {
          ...obj,
          product: {
            title: product.productName || product.productNameEn,
            images,
            salePrice: Number(((variantInfo ? variantInfo.variantSellPrice : priced.sellPrice) * rate).toFixed(2)),
            status: 'active',
            cjProductId: product.pid,
            variantName: variantInfo?.variantName,
          }
        };
      }
    } catch (e) {
      // Return item as is if fetch fails
    }
    return obj;
  }));

  const cartObj = cart.toObject();
  cartObj.items = enrichedItems as any;
  
  return cartObj;
}

// ─── Get cart ─────────────────────────────────────────────────────────────────

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  res.json(ok('Cart fetched', cart));
});

// ─── Add item ─────────────────────────────────────────────────────────────────

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, qty = 1, variantId } = req.body as {
    productId?: string; qty?: number; variantId?: string;
  };

  if (!productId) throw new ApiError(400, 'productId is required');

  const product = await cjApiService.getProductDetail(productId);
  if (!product) throw new ApiError(404, 'Product not found or unavailable');
  
  const priced = await pricingService.applyPricingToProductDetail(product as any);

  let priceSnapshot = priced.sellPrice;
  if (variantId) {
    const variant = priced.variants?.find((v: any) => v.vid === variantId);
    if (!variant) throw new ApiError(400, 'Variant not found');
    if (variant.stock !== undefined && variant.stock < qty) throw new ApiError(400, 'Insufficient stock for this variant');
    priceSnapshot = variant.variantSellPrice;
  }

  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) throw new ApiError(500, 'Cart not found');

  if (cart.lockedForCheckout) {
    throw new ApiError(409, 'Cart is locked during checkout — complete or cancel checkout first');
  }

  // Find existing item
  const existingIdx = cart.items.findIndex(
    (i) => i.productId === productId && i.variantId === variantId,
  );

  if (existingIdx > -1) {
    cart.items[existingIdx].qty           += qty;
    cart.items[existingIdx].priceSnapshot  = priceSnapshot;
  } else {
    cart.items.push({
      productId,
      variantId,
      qty,
      priceSnapshot,
    });
  }

  await cart.save();
  const enrichedCart = await getOrCreateCart(req.user!.id);

  res.json(ok('Item added to cart', enrichedCart));
});

// ─── Update item quantity ─────────────────────────────────────────────────────

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params as { itemId: string };
  const { qty }    = req.body as { qty?: number };

  if (!qty || qty < 1) throw new ApiError(400, 'qty must be at least 1');

  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) throw new ApiError(404, 'Cart not found');
  if (cart.lockedForCheckout) throw new ApiError(409, 'Cart is locked during checkout');

  const item = cart.items.find((i) => String((i as any)._id) === itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');

  item.qty = qty;
  await cart.save();
  const enrichedCart = await getOrCreateCart(req.user!.id);

  res.json(ok('Cart item updated', enrichedCart));
});

// ─── Remove item ──────────────────────────────────────────────────────────────

export const removeCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { itemId } = req.params as { itemId: string };

  const cart = await Cart.findOne({ user: req.user!.id });
  if (!cart) throw new ApiError(404, 'Cart not found');
  if (cart.lockedForCheckout) throw new ApiError(409, 'Cart is locked during checkout');

  const initialLen = cart.items.length;
  cart.items = cart.items.filter((i) => String((i as any)._id) !== itemId) as typeof cart.items;

  if (cart.items.length === initialLen) throw new ApiError(404, 'Cart item not found');

  await cart.save();
  const enrichedCart = await getOrCreateCart(req.user!.id);

  res.json(ok('Item removed from cart', enrichedCart));
});

// ─── Clear cart ───────────────────────────────────────────────────────────────

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { items: [], lockedForCheckout: false, couponCode: undefined, couponDiscount: 0 } },
    { new: true },
  );
  res.json(ok('Cart cleared', {}));
});

// ─── Lock cart for checkout ───────────────────────────────────────────────────

export const lockCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { lockedForCheckout: true } },
    { new: true },
  );
  if (!cart) throw new ApiError(404, 'Cart not found');
  res.json(ok('Cart locked for checkout', {}));
});

// ─── Unlock cart ─────────────────────────────────────────────────────────────

export const unlockCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { lockedForCheckout: false } },
    { new: true },
  );
  if (!cart) throw new ApiError(404, 'Cart not found');
  res.json(ok('Cart unlocked', {}));
});

// ─── Apply coupon ─────────────────────────────────────────────────────────────

export const applyCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { couponCode } = req.body as { couponCode?: string };
  if (!couponCode) throw new ApiError(400, 'couponCode is required');

  const { Coupon } = await import('../models/Coupon.model');
  const coupon = await Coupon.findOne({
    code:     couponCode.toUpperCase(),
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  });
  if (!coupon) throw new ApiError(404, 'Invalid or expired coupon code');

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { couponCode: coupon.code, couponDiscount: coupon.value } },
  );

  res.json(ok('Coupon applied', { coupon: { code: coupon.code, discountType: coupon.discountType, value: coupon.value } }));
});
