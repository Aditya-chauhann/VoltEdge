import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceConfig extends Document {
  platformMarginPercent: number;
  taxRatePercent: number;
  paymentGatewayFeePercent: number;
  fixedGatewayFeeInr: number;
}

const financeConfigSchema = new Schema<IFinanceConfig>(
  {
    platformMarginPercent: { type: Number, default: 20 },
    taxRatePercent: { type: Number, default: 18 },
    paymentGatewayFeePercent: { type: Number, default: 2 },
    fixedGatewayFeeInr: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FinanceConfig = mongoose.model<IFinanceConfig>('FinanceConfig', financeConfigSchema);
