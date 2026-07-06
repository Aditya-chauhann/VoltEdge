/**
 * SyncLog Model
 * Records every CJ Dropshipping product sync run for monitoring
 * and debugging inconsistent API responses.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISyncLog extends Document {
  runAt:              Date;
  durationMs:         number;
  fetched:            number;  // total products received from CJ
  added:              number;  // new products inserted
  updated:            number;  // existing products updated
  flaggedUnavailable: number;  // products marked unavailable (hit miss threshold)
  syncErrors:         string[];
  categories:         string[]; // which category keywords were synced
  status:             'success' | 'partial' | 'failed';
}

const SyncLogSchema = new Schema<ISyncLog>(
  {
    runAt:              { type: Date, required: true },
    durationMs:         { type: Number, default: 0 },
    fetched:            { type: Number, default: 0 },
    added:              { type: Number, default: 0 },
    updated:            { type: Number, default: 0 },
    flaggedUnavailable: { type: Number, default: 0 },
    syncErrors:         [{ type: String }],
    categories:         [{ type: String }],
    status:             { type: String, enum: ['success', 'partial', 'failed'], default: 'success' },
  },
  {
    // No updatedAt needed — logs are append-only
    timestamps: { createdAt: false, updatedAt: false },
  },
);

export const SyncLog = mongoose.model<ISyncLog>('SyncLog', SyncLogSchema);
