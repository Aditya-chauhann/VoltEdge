import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncLog extends Document {
  type: string; // 'PRODUCT_LIST', 'PRODUCT_DETAIL', 'CATEGORY_TREE'
  queryKey: string; // The redis cache key or identifier
  totalProducts: number;
  hasChanges: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SyncLogSchema = new Schema<ISyncLog>(
  {
    type: { type: String, required: true },
    queryKey: { type: String, required: true },
    totalProducts: { type: Number, required: true, default: 0 },
    hasChanges: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// Index for easy querying
SyncLogSchema.index({ type: 1, createdAt: -1 });

export const SyncLog = mongoose.model<ISyncLog>('SyncLog', SyncLogSchema);
