/**
 * Order Controller
 * Handles: Razorpay order creation, payment verification,
 * COD order placement, order listing, and cancellation.
 */

import { Response } from 'express';
import { Order } from '../models/Order.model';
import { Cart } from '../models/Cart.model';
import { FinanceConfig } from '../models/FinanceConfig.model';
import { User } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';
import { createStripeCheckoutSession, verifyStripeSession } from '../services/stripe.service';
import { env } from '../config/env';
import { cjApiService } from '../services/cjApi.service';
import { pricingService } from '../services/pricing.service';
import { currencyService } from '../services/currency.service';
import { generateOrderNumber } from '../utils/generateOrderNumber';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateTotals(
  items: Array<{ unitPrice: number; qty: number }>,
  shippingFee: number,
  discount: number,
) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const total = Math.max(0, subtotal + shippingFee - discount);
  return { subtotal, shippingFee, discount, total };
}

function buildShippingAddress(rawAddress: {
  fullName: string; phone: string; line1: string;
  line2?: string; city: string; state: string; pincode: string; country?: string;
}) {
  return {
    fullName: rawAddress.fullName,
    phone: rawAddress.phone,
    line1: rawAddress.line1,
    line2: rawAddress.line2,
    city: rawAddress.city,
    state: rawAddress.state,
    pincode: rawAddress.pincode,
    country: rawAddress.country ?? 'India',
  };
}

async function buildOrderItems(userId: string) {
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const orderItems = [];

  const rate = await currencyService.getUsdToInrRate();

  for (const item of cart.items) {
    const product = await cjApiService.getProductDetail(item.productId);
    if (!product) {
      throw new ApiError(400, `Product no longer available on CJ Dropshipping`);
    }

    const priced = await pricingService.applyPricingToProductDetail(product as any);
    const images = product.productImages?.length ? product.productImages : (product.productImage ? [product.productImage] : []);

    let currentPrice = priced.sellPrice;
    let variantName = undefined;
    let fallbackVariantId = undefined;

    if (item.variantId) {
      const variant = priced.variants?.find((v: any) => v.vid === item.variantId);
      if (!variant) throw new ApiError(400, `Variant not found`);
      if (variant.stock !== undefined && variant.stock < item.qty) throw new ApiError(400, `Insufficient stock for this variant`);
      currentPrice = variant.variantSellPrice;
      variantName = variant.variantName;
    } else if (priced.variants && priced.variants.length > 0) {
      const variant = priced.variants[0];
      fallbackVariantId = variant.vid;
      currentPrice = variant.variantSellPrice;
      variantName = variant.variantName;
    }

    const priceInr = Number((currentPrice * rate).toFixed(2));

    orderItems.push({
      productId: product.pid,
      title: product.productName || product.productNameEn,
      image: images[0] ?? '',
      variantId: item.variantId,
      variantName: variantName,
      qty: item.qty,
      unitPrice: priceInr,
      total: priceInr * item.qty,
      cjProductId: product.pid,
      cjVariantId: item.variantId || fallbackVariantId,
    });
  }

  return { orderItems, cart };
}

// ─── Stripe Checkout ───────────────────────────────────────────────────────────

export const createStripeCheckout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { addressId, couponCode } = req.body as { addressId?: string; couponCode?: string };

  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  let shippingAddr;
  if (addressId) {
    const addr = user.addresses.find((a) => String(a._id) === addressId);
    if (!addr) throw new ApiError(400, 'Saved address not found');
    shippingAddr = buildShippingAddress(addr);
  } else {
    const { fullName, phone, line1, line2, city, state, pincode } = req.body;
    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      throw new ApiError(400, 'Complete shipping address is required');
    }
    shippingAddr = buildShippingAddress(req.body);
  }

  const { orderItems, cart } = await buildOrderItems(req.user!.id);

  const shippingFee = 0; // Free shipping
  const discount = cart.couponDiscount ?? 0;
  const { subtotal, total } = calculateTotals(orderItems, shippingFee, discount);

  const finConfig = await FinanceConfig.findOne() || await FinanceConfig.create({});
  if (total < finConfig.minimumOrderAmount) throw new ApiError(400, `Minimum order value for wholesale is ₹${finConfig.minimumOrderAmount.toLocaleString()}`);

  const orderNumber = generateOrderNumber();

  // Lock the cart during checkout
  await Cart.findOneAndUpdate({ user: req.user!.id }, { lockedForCheckout: true });

  // Create a pending order in DB
  const order = await Order.create({
    orderNumber,
    user: req.user!.id,
    items: orderItems,
    shippingAddress: shippingAddr,
    subtotal,
    shippingFee,
    discount,
    couponCode: cart.couponCode,
    total,
    paymentMethod: 'stripe',
    paymentStatus: 'pending',
    orderStatus: 'placed',
    statusHistory: [{ status: 'placed', message: 'Order created, awaiting payment', timestamp: new Date() }],
  });

  // Create Stripe Checkout Session
  const session = await createStripeCheckoutSession({
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    amount: Math.round(total * 100), // Stripe expects amounts in smallest currency unit (paise)
    currency: 'inr',
    customerEmail: user.email,
    successUrl: `${env.FRONTEND_URL}/checkout/success`,
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.json(ok('Stripe checkout session created', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    sessionId: session.id,
    sessionUrl: session.url,
  }));
});

export const verifyStripeCheckout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.body as { sessionId: string };
  if (!sessionId) throw new ApiError(400, 'Session ID is required');

  const session = await verifyStripeSession(sessionId);
  
  const order = await Order.findOne({ stripeSessionId: sessionId, user: req.user!.id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.paymentStatus === 'paid') {
    return res.json(ok('Payment already verified', { orderNumber: order.orderNumber }));
  }

  if (session.payment_status !== 'paid') {
    order.paymentStatus = 'failed';
    order.statusHistory.push({ status: 'failed', message: 'Payment verification failed or pending', timestamp: new Date() });
    await order.save();
    await Cart.findOneAndUpdate({ user: req.user!.id }, { lockedForCheckout: false });
    throw new ApiError(400, 'Payment not completed');
  }

  // Mark as paid
  order.paymentStatus = 'paid';
  order.stripePaymentIntentId = session.payment_intent as string;
  order.orderStatus = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    message: 'Payment received — order confirmed',
    timestamp: new Date(),
  });
  await order.save();

  // Clear and unlock the cart
  await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { items: [], lockedForCheckout: false, couponCode: undefined, couponDiscount: 0 } },
  );

  // Fulfill with CJ Dropshipping asynchronously
  const cjPayload = {
    orderNumber: order.orderNumber,
    shippingZip: order.shippingAddress.pincode,
    shippingCountryCode: 'IN', // Assuming IN for now
    shippingCountry: order.shippingAddress.country,
    shippingProvince: order.shippingAddress.state,
    shippingCity: order.shippingAddress.city,
    shippingAddress: order.shippingAddress.line1 + (order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''),
    shippingCustomerName: order.shippingAddress.fullName,
    shippingPhone: order.shippingAddress.phone,
    fromCountryCode: 'CN',
    logisticName: 'CJPacket',
    products: order.items.map(i => ({ vid: i.cjVariantId || i.cjProductId, quantity: i.qty }))
  };

  cjApiService.createOrder(cjPayload).then(async (result) => {
    if (result) {
      await Order.findByIdAndUpdate(order._id, {
        cjOrderId: result.orderId,
        orderStatus: 'processing',
        $push: {
          statusHistory: {
            status: 'processing',
            message: 'Order sent to supplier for fulfillment',
            timestamp: new Date(),
          },
        },
      });
    }
  }).catch((err) => console.error('CJ fulfillment error:', err));

  res.json(ok('Payment verified — order confirmed!', {
    orderNumber: order.orderNumber,
    orderId: order._id,
  }));
});

// ─── COD order ────────────────────────────────────────────────────────────────

export const placeCODOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { addressId } = req.body as { addressId?: string };

  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');

  let shippingAddr;
  if (addressId) {
    const addr = user.addresses.find((a) => String(a._id) === addressId);
    if (!addr) throw new ApiError(400, 'Saved address not found');
    shippingAddr = buildShippingAddress(addr);
  } else {
    const { fullName, phone, line1, line2, city, state, pincode } = req.body;
    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      throw new ApiError(400, 'Complete shipping address is required');
    }
    shippingAddr = buildShippingAddress(req.body);
  }

  const { orderItems, cart } = await buildOrderItems(req.user!.id);

  const discount = cart.couponDiscount ?? 0;
  const { subtotal, total } = calculateTotals(orderItems, 0, discount);

  const finConfig = await FinanceConfig.findOne() || await FinanceConfig.create({});
  if (total < finConfig.minimumOrderAmount) throw new ApiError(400, `Minimum order value for wholesale is ₹${finConfig.minimumOrderAmount.toLocaleString()}`);

  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: req.user!.id,
    items: orderItems,
    shippingAddress: shippingAddr,
    subtotal,
    shippingFee: 0,
    discount,
    couponCode: cart.couponCode,
    total,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    statusHistory: [
      { status: 'placed', message: 'COD order placed', timestamp: new Date() },
      { status: 'confirmed', message: 'Order confirmed — pay on delivery', timestamp: new Date() },
    ],
  });

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { $set: { items: [], lockedForCheckout: false, couponCode: undefined, couponDiscount: 0 } },
  );

  // Asynchronous CJ fulfillment
  const cjPayload = {
    orderNumber: order.orderNumber,
    shippingZip: order.shippingAddress.pincode,
    shippingCountryCode: 'IN',
    shippingCountry: order.shippingAddress.country,
    shippingProvince: order.shippingAddress.state,
    shippingCity: order.shippingAddress.city,
    shippingAddress: order.shippingAddress.line1 + (order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''),
    shippingCustomerName: order.shippingAddress.fullName,
    shippingPhone: order.shippingAddress.phone,
    fromCountryCode: 'CN',
    logisticName: 'CJPacket',
    products: order.items.map(i => ({ vid: i.cjVariantId || i.cjProductId, quantity: i.qty }))
  };

  cjApiService.createOrder(cjPayload).then(async (result) => {
    if (result) {
      await Order.findByIdAndUpdate(order._id, {
        cjOrderId: result.orderId,
        orderStatus: 'processing',
        $push: {
          statusHistory: {
            status: 'processing',
            message: 'Order sent to supplier',
            timestamp: new Date(),
          },
        },
      });
    }
  }).catch((err) => console.error('CJ fulfillment (COD) error:', err));

  res.status(201).json(ok('COD order placed successfully!', {
    orderNumber: order.orderNumber,
    orderId: order._id,
  }));
});

// ─── List user orders ─────────────────────────────────────────────────────────

export const listOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, parseInt(limit, 10));

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user!.id })
      .select('-razorpaySignature -__v')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Order.countDocuments({ user: req.user!.id }),
  ]);

  res.json(ok('Orders fetched', {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }));
});

// ─── Single order ─────────────────────────────────────────────────────────────

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const order = await Order.findOne({ _id: id, user: req.user!.id })
    .select('-razorpaySignature')
    .lean();

  if (!order) throw new ApiError(404, 'Order not found');

  res.json(ok('Order fetched', order));
});

// ─── Cancel order ─────────────────────────────────────────────────────────────

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const order = await Order.findOne({ _id: id, user: req.user!.id });
  if (!order) throw new ApiError(404, 'Order not found');

  const cancellable = ['placed', 'confirmed', 'processing'];
  if (!cancellable.includes(order.orderStatus)) {
    throw new ApiError(400, `Order cannot be cancelled in "${order.orderStatus}" status`);
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    message: req.body.reason ?? 'Cancelled by customer',
    timestamp: new Date(),
  });
  await order.save();

  res.json(ok('Order cancelled', order));
});

