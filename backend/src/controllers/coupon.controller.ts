/**
 * Coupon Controller
 * Validates coupon codes at checkout.
 */

import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const validateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, orderTotal } = req.body as { code?: string; orderTotal?: number };

  if (!code) throw new ApiError(400, 'Coupon code is required');

  const coupon = await Coupon.findOne({
    code:     code.toUpperCase().trim(),
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  });

  if (!coupon) throw new ApiError(404, 'Invalid or expired coupon code');

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'This coupon has reached its usage limit');
  }

  if (orderTotal && coupon.minOrderValue > 0 && orderTotal < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value for this coupon is ₹${coupon.minOrderValue}`);
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.value;
  } else if (coupon.discountType === 'percent') {
    discount = ((orderTotal ?? 0) * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }

  res.json(ok('Coupon is valid', {
    code:         coupon.code,
    discountType: coupon.discountType,
    value:        coupon.value,
    discount:     Math.round(discount),
    description:  coupon.description,
  }));
});
