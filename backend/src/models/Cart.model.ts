/**
 * Cart Model
 * Persists the shopping cart server-side, one document per user.
 * The cart is locked (lockedForCheckout: true) when the user enters
 * the checkout flow, preventing mid-payment modifications.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId:  string;
  variantId?: string;
  qty:        number;
  // Price snapshot at time of add-to-cart, re-verified at checkout
  priceSnapshot: number;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId:     { type: String, required: true },
    variantId:     { type: String },
    qty:           { type: Number, required: true, min: 1, default: 1 },
    priceSnapshot: { type: Number, required: true },
  },
  { _id: true },
);

export interface ICart extends Document {
  user:               mongoose.Types.ObjectId;
  items:              ICartItem[];
  lockedForCheckout:  boolean;  // true while user is in the checkout flow
  couponCode?:        string;
  couponDiscount:     number;
  createdAt:          Date;
  updatedAt:          Date;
}

const CartSchema = new Schema<ICart>(
  {
    user:              { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items:             { type: [CartItemSchema], default: [] },
    lockedForCheckout: { type: Boolean, default: false },
    couponCode:        { type: String },
    couponDiscount:    { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
