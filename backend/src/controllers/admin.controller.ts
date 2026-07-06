/**
 * Admin Controller
 * Dashboard stats, order/user management, etc.
 * All routes require role: admin.
 */

import { Request, Response } from 'express';
import { Order } from '../models/Order.model';
import { User } from '../models/User.model';
import { Category } from '../models/Category.model';
import { Coupon } from '../models/Coupon.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month

  const [
    totalOrders, monthOrders,
    totalRevenue, monthRevenue,
    totalUsers, newUsers,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: start } }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]).then((r) => r[0]?.total ?? 0),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: start } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]).then((r) => r[0]?.total ?? 0),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: start } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total orderStatus paymentMethod createdAt user')
      .populate('user', 'name email')
      .lean(),
  ]);

  res.json(ok('Dashboard stats fetched', {
    stats: {
      totalOrders, monthOrders,
      totalRevenue, monthRevenue,
      totalUsers, newUsers,
    },
    recentOrders,
  }));
});

// ─── Orders (admin) ───────────────────────────────────────────────────────────

export const adminListOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status, paymentStatus } = req.query as Record<string, string>;
  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));

  const filter: Record<string, unknown> = {};
  if (status)        filter.orderStatus   = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('user', 'name email phone')
      .select('-razorpaySignature')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json(ok('Orders fetched', {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }));
});

export const adminUpdateOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { orderStatus, paymentStatus, trackingNumber, trackingUrl, cjOrderId, message } = req.body as Record<string, string>;

  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (orderStatus) order.orderStatus = orderStatus as typeof order.orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus as typeof order.paymentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl)    order.trackingUrl    = trackingUrl;
  if (cjOrderId)      order.cjOrderId      = cjOrderId;

  if (orderStatus) {
    order.statusHistory.push({
      status:    orderStatus,
      message:   message ?? `Status updated to ${orderStatus} by admin`,
      timestamp: new Date(),
    });
  }

  await order.save();

  res.json(ok('Order updated', order));
});

// ─── Users (admin) ────────────────────────────────────────────────────────────

export const adminListUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));

  const [users, total] = await Promise.all([
    User.find({ role: 'customer' })
      .select('-passwordHash -wishlist')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    User.countDocuments({ role: 'customer' }),
  ]);

  res.json(ok('Users fetched', {
    users,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }));
});

// ─── Categories (admin) ───────────────────────────────────────────────────────

export const adminCreateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, image, icon, cjKeyword, sortOrder } = req.body;

  const cat = await Category.create({ name, slug, description, image, icon, cjKeyword, sortOrder });
  res.status(201).json(ok('Category created', cat));
});

export const adminUpdateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const cat = await Category.findByIdAndUpdate(id, { $set: req.body }, { new: true });
  if (!cat) throw new ApiError(404, 'Category not found');
  res.json(ok('Category updated', cat));
});

// ─── Coupons (admin) ──────────────────────────────────────────────────────────

export const adminCreateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(ok('Coupon created', coupon));
});

export const adminListCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json(ok('Coupons fetched', coupons));
});

export const adminUpdateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const coupon = await Coupon.findByIdAndUpdate(id, { $set: req.body }, { new: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json(ok('Coupon updated', coupon));
});

