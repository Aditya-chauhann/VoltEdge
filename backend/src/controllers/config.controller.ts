import { Request, Response } from 'express';
import { FinanceConfig } from '../models/FinanceConfig.model';
import { ok } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getPublicConfig = asyncHandler(async (_req: Request, res: Response) => {
  let config = await FinanceConfig.findOne();
  if (!config) {
    config = await FinanceConfig.create({});
  }
  
  res.json(
    ok('Public config fetched', {
      minimumOrderAmount: config.minimumOrderAmount,
      currencyRates: config.currencyRates,
    })
  );
});
