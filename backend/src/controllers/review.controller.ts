/**
 * Review Controller
 * Handles product review creation, listing, and rating aggregation.
 */

import { Request, Response } from 'express';
import { Review } from '../models/Review.model';
import { Order } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { cjApiService } from '../services/cjApi.service';

// ─── Add review ───────────────────────────────────────────────────────────────

export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params as { productId: string };
  const { rating, title, body, images } = req.body as {
    rating?: number; title?: string; body?: string; images?: string[];
  };

  if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be between 1 and 5');
  if (!body?.trim()) throw new ApiError(400, 'Review text is required');

  const product = await cjApiService.getProductDetail(productId);
  if (!product) throw new ApiError(404, 'Product not found on CJ Dropshipping');

  // Check if user has already reviewed this product
  const existing = await Review.findOne({ productId: productId, user: req.user!.id });
  if (existing) throw new ApiError(409, 'You have already reviewed this product');

  // Check if user has purchased this product (for verified badge)
  const verifiedOrder = await Order.findOne({
    user:          req.user!.id,
    orderStatus:   'delivered',
    'items.productId': productId,
  });

  const review = await Review.create({
    productId:  productId,
    user:       req.user!.id,
    rating,
    title:      title?.trim(),
    body:       body.trim(),
    images:     images ?? [],
    isVerified: !!verifiedOrder,
  });

  await review.populate('user', 'name');

  res.status(201).json(ok('Review submitted', review));
});

// ─── List reviews for a product ───────────────────────────────────────────────

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params as { productId: string };
  const { page = '1', limit = '10', sort = 'newest' } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, parseInt(limit, 10));
  const skip     = (pageNum - 1) * limitNum;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest:  { createdAt: -1 },
    oldest:  { createdAt:  1 },
    highest: { rating: -1 },
    lowest:  { rating:  1 },
    helpful: { helpfulCount: -1 },
  };
  const sortObj = sortMap[sort] ?? sortMap.newest;

  const [reviews, total] = await Promise.all([
    Review.find({ productId: productId })
      .populate('user', 'name')
      .sort(sortObj as any)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ productId: productId }),
  ]);

  // Rating distribution
  const dist = await Review.aggregate([
    { $match: { productId: productId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.json(ok('Reviews fetched', {
    reviews,
    ratingDistribution: dist,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }));
});

// ─── Mark review as helpful ───────────────────────────────────────────────────

export const markHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params as { reviewId: string };

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true },
  );
  if (!review) throw new ApiError(404, 'Review not found');

  res.json(ok('Marked as helpful', { helpfulCount: review.helpfulCount }));
});
