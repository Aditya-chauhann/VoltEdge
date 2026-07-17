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
import { Banner } from '../models/Banner.model';
import { FinanceConfig } from '../models/FinanceConfig.model';
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
    statusCounts,
    pendingActionOrders,
    prepaidCancelledOrders
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: start }, orderStatus: { $nin: ['cancelled', 'returned'] } }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]).then((r) => r[0]?.total ?? 0),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: start }, orderStatus: { $nin: ['cancelled', 'returned'] } } },
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
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'return_requested'] } }),
    Order.countDocuments({ orderStatus: 'cancelled', paymentStatus: 'paid', paymentMethod: { $ne: 'cod' } })
  ]);

  // Transform statusCounts into a funnel map
  const funnelMap = statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  const funnel = {
    placed: (funnelMap['placed'] || 0) + (funnelMap['confirmed'] || 0) + (funnelMap['processing'] || 0) + (funnelMap['shipped'] || 0) + (funnelMap['delivered'] || 0),
    confirmed: (funnelMap['confirmed'] || 0) + (funnelMap['processing'] || 0) + (funnelMap['shipped'] || 0) + (funnelMap['delivered'] || 0),
    shipped: (funnelMap['shipped'] || 0) + (funnelMap['delivered'] || 0),
    delivered: (funnelMap['delivered'] || 0),
    returned: (funnelMap['returned'] || 0),
    cancelled: (funnelMap['cancelled'] || 0),
  };

  const pendingActions = {
    ordersToConfirm: funnelMap['placed'] || 0,
    returnsRequested: funnelMap['return_requested'] || 0,
    refundsPending: prepaidCancelledOrders,
  };

  res.json(ok('Dashboard stats fetched', {
    stats: {
      totalOrders, monthOrders,
      totalRevenue, monthRevenue,
      totalUsers, newUsers,
    },
    funnel,
    pendingActions,
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

export const adminBulkUpdateOrders = asyncHandler(async (req: Request, res: Response) => {
  const { orderIds, orderStatus, paymentStatus, message } = req.body;
  
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new ApiError(400, 'orderIds array is required');
  }

  const updateFields: any = {};
  if (orderStatus) updateFields.orderStatus = orderStatus;
  if (paymentStatus) updateFields.paymentStatus = paymentStatus;

  const statusHistoryEntry = {
    status: orderStatus || 'updated',
    message: message ?? `Bulk status updated by admin`,
    timestamp: new Date(),
  };

  await Order.updateMany(
    { _id: { $in: orderIds } },
    { 
      $set: updateFields,
      $push: { statusHistory: statusHistoryEntry }
    }
  );

  res.json(ok(`Successfully updated ${orderIds.length} orders`, { count: orderIds.length }));
});

// ─── Users (admin) ────────────────────────────────────────────────────────────

export const adminListUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search = '' } = req.query as Record<string, string>;
  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, parseInt(limit, 10));

  const filter: any = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalSpend: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: { $eq: ['$$order.paymentStatus', 'paid'] }
                  }
                },
                as: 'paidOrder',
                in: '$$paidOrder.total'
              }
            }
          }
        }
      },
      {
        $project: {
          passwordHash: 0,
          wishlist: 0,
          orders: 0, // don't send all order data in list
        }
      }
    ]),
    User.countDocuments(filter),
  ]);

  res.json(ok('Users fetched', {
    users,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }));
});

export const adminGetUserDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const orders = await Order.find({ user: id }).sort({ createdAt: -1 }).lean();

  res.json(ok('User detail fetched', { user, orders }));
});

export const adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { blocked, addWalletAmount, walletReason } = req.body;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  // We can add an isBlocked field to User schema if it doesn't exist.
  // Wait, let's just add it dynamically if we want, or define it in schema.
  // Actually, we'll update the schema in another tool call if needed.
  if (typeof blocked === 'boolean') {
    (user as any).isBlocked = blocked;
  }

  if (addWalletAmount && walletReason) {
    const amount = Number(addWalletAmount);
    user.walletBalance = (user.walletBalance || 0) + amount;
    user.walletHistory.push({
      amount: Math.abs(amount),
      type: amount >= 0 ? 'credit' : 'debit',
      description: walletReason,
      timestamp: new Date(),
    });
  }

  await user.save();
  res.json(ok('User updated', user));
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

// ─── Banners (Content) ────────────────────────────────────────────────────────

export const adminGetBanners = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await Banner.find().sort({ order: 1 }).lean();
  res.json(ok('Banners fetched', banners));
});

export const adminCreateBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(ok('Banner created', banner));
});

export const adminUpdateBanner = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const banner = await Banner.findByIdAndUpdate(id, { $set: req.body }, { new: true });
  if (!banner) throw new ApiError(404, 'Banner not found');
  res.json(ok('Banner updated', banner));
});

export const adminDeleteBanner = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await Banner.findByIdAndDelete(id);
  res.json(ok('Banner deleted', {}));
});

// ─── Finance Config ───────────────────────────────────────────────────────────

export const adminGetFinanceConfig = asyncHandler(async (_req: Request, res: Response) => {
  let config = await FinanceConfig.findOne();
  if (!config) {
    config = await FinanceConfig.create({});
  }
  res.json(ok('Finance config fetched', config));
});

export const adminUpdateFinanceConfig = asyncHandler(async (req: Request, res: Response) => {
  let config = await FinanceConfig.findOne();
  if (!config) {
    config = await FinanceConfig.create(req.body);
  } else {
    config = await FinanceConfig.findByIdAndUpdate(config._id, { $set: req.body }, { new: true });
  }
  res.json(ok('Finance config updated successfully', config));
});

// ─── Settings ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';

export const updateAdminSecret = asyncHandler(async (req: Request, res: Response) => {
  const { newSecret } = req.body as { newSecret?: string };
  if (!newSecret || newSecret.length < 6) {
    throw new ApiError(400, 'New admin secret must be at least 6 characters');
  }

  // Define the path to the .env file (root of the backend folder)
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    throw new ApiError(500, '.env file not found');
  }

  // Read .env
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Replace or append ADMIN_SECRET
  const secretRegex = /^ADMIN_SECRET=.*$/m;
  if (secretRegex.test(envContent)) {
    envContent = envContent.replace(secretRegex, `ADMIN_SECRET=${newSecret}`);
  } else {
    envContent += `\nADMIN_SECRET=${newSecret}\n`;
  }

  // Write back to .env
  fs.writeFileSync(envPath, envContent, 'utf8');

  // Update process.env and config dynamically for the current runtime
  process.env.ADMIN_SECRET = newSecret;
  // We cannot modify the readonly `env` object properties directly in TS without a cast, 
  // but updating process.env is usually enough for the next read, 
  // or we cast `env` to any if needed. To be safe, we cast.
  const configEnv = require('../config/env').env;
  (configEnv as any).ADMIN_SECRET = newSecret;

  res.json(ok('Admin secret updated successfully', {}));
});
