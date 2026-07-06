/**
 * Category Model
 * Represents product categories (e.g. Smartphones, Laptops).
 * Supports a one-level parent/child hierarchy.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name:        string;
  slug:        string;
  description: string;
  image?:      string;
  icon?:       string;        // emoji or icon name
  parentId?:   mongoose.Types.ObjectId;
  sortOrder:   number;
  isActive:    boolean;
  // CJ Dropshipping category keyword for sync
  cjKeyword?:  string;
  createdAt:   Date;
  updatedAt:   Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image:       { type: String },
    icon:        { type: String },
    parentId:    { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    sortOrder:   { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    cjKeyword:   { type: String }, // keyword passed to CJ product search
  },
  { timestamps: true },
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
