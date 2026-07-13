import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderIssue extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderIssueSchema = new Schema<IOrderIssue>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status:  { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const OrderIssue = mongoose.model<IOrderIssue>('OrderIssue', OrderIssueSchema);
