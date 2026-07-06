/**
 * Coupon Model
 * Discount codes with flexible configuration:
 * flat amount, percentage, or free shipping.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code:          string;
  description:   string;
  discountType:  'flat' | 'percent' | 'free_shipping';
  value:         number;      // INR amount or percentage
  minOrderValue: number;      // minimum cart total to apply
  maxDiscount?:  number;      // cap for percent coupons
  usageLimit:    number;      // total uses allowed (0 = unlimited)
  usedCount:     number;
  userLimit:     number;      // uses per user (0 = unlimited)
  expiresAt?:    Date;
  isActive:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:   { type: String, default: '' },
    discountType:  { type: String, enum: ['flat', 'percent', 'free_shipping'], required: true },
    value:         { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount:   { type: Number },
    usageLimit:    { type: Number, default: 0 },
    usedCount:     { type: Number, default: 0 },
    userLimit:     { type: Number, default: 1 },
    expiresAt:     { type: Date },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
