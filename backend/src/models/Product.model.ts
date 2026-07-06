import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  pid: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

const ProductSchema = new Schema(
  {
    pid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
