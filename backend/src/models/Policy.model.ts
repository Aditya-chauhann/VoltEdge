import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicy extends Document {
  type: 'refund_shipping' | 'privacy';
  content: string;
  updatedAt: Date;
}

const PolicySchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['refund_shipping', 'privacy'],
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
      default: '<p>Content coming soon.</p>',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Policy || mongoose.model<IPolicy>('Policy', PolicySchema);
