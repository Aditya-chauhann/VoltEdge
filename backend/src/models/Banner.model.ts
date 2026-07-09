import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  imageUrl: string;
  headline: string;
  subtext: string;
  buttonLabel: string;
  buttonLink: string;
  overlayDarkness: number; // 0 to 100
  isActive: boolean;
  order: number;
}

const bannerSchema = new Schema<IBanner>(
  {
    imageUrl: { type: String, required: true },
    headline: { type: String, required: true },
    subtext: { type: String },
    buttonLabel: { type: String },
    buttonLink: { type: String },
    overlayDarkness: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
