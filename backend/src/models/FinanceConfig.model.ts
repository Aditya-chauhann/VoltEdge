import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceConfig extends Document {
  platformMarginPercent: number;
  taxRatePercent: number;
  paymentGatewayFeePercent: number;
  fixedGatewayFeeInr: number;
  minimumOrderAmount: number;
  currencyRates: {
    USD: number;
    EUR: number;
    GBP: number;
    AED: number;
  };
}

const financeConfigSchema = new Schema<IFinanceConfig>(
  {
    platformMarginPercent: { type: Number, default: 20 },
    taxRatePercent: { type: Number, default: 18 },
    paymentGatewayFeePercent: { type: Number, default: 2 },
    fixedGatewayFeeInr: { type: Number, default: 0 },
    minimumOrderAmount: { type: Number, default: 50000 },
    currencyRates: {
      USD: { type: Number, default: 83.33 },
      EUR: { type: Number, default: 90.90 },
      GBP: { type: Number, default: 105.26 },
      AED: { type: Number, default: 22.68 },
    },
  },
  { timestamps: true }
);

export const FinanceConfig = mongoose.model<IFinanceConfig>('FinanceConfig', financeConfigSchema);
