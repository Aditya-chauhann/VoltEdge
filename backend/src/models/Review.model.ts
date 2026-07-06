/**
 * Review Model
 * Customer product reviews with optional image uploads.
 * Indexed for fast per-product aggregation.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  productId:  string;
  user:       mongoose.Types.ObjectId;
  order?:     mongoose.Types.ObjectId;
  rating:     number;         // 1–5
  title?:     string;
  body:       string;
  images:     string[];       // URLs of uploaded review photos
  isVerified: boolean;        // purchased the item
  helpfulCount: number;
  createdAt:  Date;
  updatedAt:  Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId:    { type: String, required: true, index: true },
    user:         { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    order:        { type: Schema.Types.ObjectId, ref: 'Order' },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    title:        { type: String, maxlength: 120 },
    body:         { type: String, required: true, maxlength: 2000 },
    images:       [{ type: String }],
    isVerified:   { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Prevent a user from reviewing the same product twice
ReviewSchema.index({ productId: 1, user: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
