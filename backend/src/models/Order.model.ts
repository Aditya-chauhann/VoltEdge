/**
 * Order Model
 * Stores the full snapshot of every order: items, pricing at time of purchase,
 * shipping address, payment info, status history, and CJ fulfillment reference.
 */

import mongoose, { Document, Schema } from 'mongoose';

/** Snapshot of one line item at the time of order */
export interface IOrderItem {
  productId:   string;
  title:       string;
  image:       string;
  variantId?:  string;
  variantName?: string;
  qty:         number;
  unitPrice:   number; // price at time of purchase (INR)
  total:       number;
  cjProductId: string;
  cjVariantId?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId:   { type: String, required: true },
    title:       { type: String, required: true },
    image:       { type: String, default: '' },
    variantId:   { type: String },
    variantName: { type: String },
    qty:         { type: Number, required: true, min: 1 },
    unitPrice:   { type: Number, required: true },
    total:       { type: Number, required: true },
    cjProductId: { type: String, required: true },
    cjVariantId: { type: String },
  },
  { _id: false },
);

/** One entry in the order status history timeline */
export interface IStatusEvent {
  status:    string;
  message?:  string;
  timestamp: Date;
}

const StatusEventSchema = new Schema<IStatusEvent>(
  {
    status:    { type: String, required: true },
    message:   { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

export interface IOrder extends Document {
  orderNumber:    string;
  user:           mongoose.Types.ObjectId;
  items:          IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone:    string;
    line1:    string;
    line2?:   string;
    city:     string;
    state:    string;
    pincode:  string;
    country:  string;
  };

  // Pricing
  subtotal:        number; // sum of item totals
  shippingFee:     number;
  discount:        number;
  couponCode?:     string;
  total:           number; // grand total (INR)

  // Payment
  paymentMethod:     'razorpay' | 'cod';
  paymentStatus:     'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?:  string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // Fulfillment
  orderStatus:       'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory:     IStatusEvent[];
  cjOrderId?:        string;        // CJ Dropshipping order ID
  cjFulfillmentRef?: string;
  trackingNumber?:   string;
  trackingUrl?:      string;
  estimatedDelivery?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user:        { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items:       { type: [OrderItemSchema], required: true },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      line1:    { type: String, required: true },
      line2:    { type: String },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      country:  { type: String, required: true, default: 'India' },
    },

    subtotal:    { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    couponCode:  { type: String },
    total:       { type: Number, required: true },

    paymentMethod:      { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus:      { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId:    { type: String },
    razorpayPaymentId:  { type: String },
    razorpaySignature:  { type: String },

    orderStatus: {
      type:    String,
      enum:    ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index:   true,
    },
    statusHistory:     { type: [StatusEventSchema], default: [] },
    cjOrderId:         { type: String },
    cjFulfillmentRef:  { type: String },
    trackingNumber:    { type: String },
    trackingUrl:       { type: String },
    estimatedDelivery: { type: Date },
  },
  { timestamps: true },
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
