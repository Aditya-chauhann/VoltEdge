import { Response } from 'express';
import { OrderIssue } from '../models/OrderIssue.model';
import { Order } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export const createOrderIssue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { subject, message } = req.body;

  if (!subject || !message) {
    throw new ApiError(400, 'Subject and message are required');
  }

  const order = await Order.findOne({ _id: id, user: req.user!.id });
  if (!order) throw new ApiError(404, 'Order not found');

  const issue = await OrderIssue.create({
    orderId: order._id,
    userId: req.user!.id,
    subject,
    message,
  });

  res.status(201).json(ok('Issue reported successfully', issue));
});

export const getOrderIssues = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10', status } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, parseInt(limit, 10));

  const filter: any = {};
  if (status) filter.status = status;

  const [issues, total] = await Promise.all([
    OrderIssue.find(filter)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber orderStatus total')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    OrderIssue.countDocuments(filter),
  ]);

  res.json(ok('Issues fetched', {
    issues,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }));
});

export const updateOrderIssue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const issue = await OrderIssue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  if (status) issue.status = status;
  if (adminNotes !== undefined) issue.adminNotes = adminNotes;

  await issue.save();

  res.json(ok('Issue updated successfully', issue));
});
