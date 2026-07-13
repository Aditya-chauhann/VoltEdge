import { Request, Response } from 'express';
import { FinanceConfig } from '../models/FinanceConfig.model';
import Policy from '../models/Policy.model';
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

export const getPolicy = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  let policy = await Policy.findOne({ type });
  if (!policy) {
    policy = await Policy.create({ type });
  }
  res.json(ok('Policy fetched', policy));
});

export const updatePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const { content } = req.body;
  
  let policy = await Policy.findOne({ type });
  if (!policy) {
    policy = await Policy.create({ type, content });
  } else {
    policy.content = content;
    await policy.save();
  }
  
  res.json(ok('Policy updated', policy));
});
