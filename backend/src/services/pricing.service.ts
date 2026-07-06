import { env } from '../config/env';

export interface PriceBreakdown {
  cjPriceUsd: number;
  cjPrice: number;
  currency: string;
  shippingCost: number;
  displayPrice: number;
  tax: number;
  platformMargin: number;
  sellingPrice: number;
  marginPercent: number;
}

export interface PricingInput {
  pid: string;
  categoryId: string;
  cjPrice: number;
  shippingCost?: number;
  includeTax?: boolean;
}

function resolveCjPriceUsd(product: { sellPrice: number; variants?: Array<{ variantSellPrice: number }> }): number {
  if (product.sellPrice > 0) return product.sellPrice;
  const variantPrices = (product.variants ?? []).map(v => v.variantSellPrice).filter(p => p > 0);
  return variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
}

class PricingService {
  async calculatePrice(input: PricingInput): Promise<PriceBreakdown> {
    const cjPrice = input.cjPrice;
    const marginPercent = env.PRICE_MARKUP_PERCENTAGE || 30;
    const platformMargin = Number(((cjPrice * marginPercent) / 100).toFixed(2));
    const displayPrice = Number((cjPrice + platformMargin).toFixed(2));
    
    return {
      cjPriceUsd: cjPrice,
      cjPrice,
      currency: 'USD',
      shippingCost: input.shippingCost ?? 0,
      displayPrice,
      tax: 0,
      platformMargin,
      sellingPrice: displayPrice,
      marginPercent,
    };
  }

  async applyPricingToProducts<
    T extends {
      pid: string;
      categoryId: string;
      sellPrice: number;
      shippingCost?: number;
      variants?: Array<{ variantSellPrice: number }>;
    },
  >(products: T[]): Promise<Array<T & { pricing: PriceBreakdown }>> {
    return Promise.all(
      products.map(async (product) => {
        const pricing = await this.calculatePrice({
          pid: product.pid,
          categoryId: product.categoryId,
          cjPrice: resolveCjPriceUsd(product),
          shippingCost: product.shippingCost,
          includeTax: false,
        });
        return { ...product, sellPrice: pricing.displayPrice, pricing };
      })
    );
  }

  async applyPricingToProductDetail<
    T extends {
      pid: string;
      categoryId: string;
      sellPrice: number;
      shippingCost?: number;
      variants?: Array<{ variantSellPrice: number } & Record<string, unknown>>;
    },
  >(product: T): Promise<T & { pricing: PriceBreakdown }> {
    const effectiveCjPriceUsd = resolveCjPriceUsd(product);
    const productPricing = await this.calculatePrice({
      pid: product.pid,
      categoryId: product.categoryId,
      cjPrice: effectiveCjPriceUsd,
      shippingCost: product.shippingCost,
      includeTax: false,
    });

    const pricedVariants = product.variants
      ? await Promise.all(
          product.variants.map(async (variant) => {
            const cjPriceUsd = variant.variantSellPrice > 0 ? variant.variantSellPrice : effectiveCjPriceUsd;
            const pricing = await this.calculatePrice({
              pid: product.pid,
              categoryId: product.categoryId,
              cjPrice: cjPriceUsd,
              shippingCost: product.shippingCost,
              includeTax: false,
            });
            return {
              ...variant,
              variantSellPrice: pricing.displayPrice,
              pricing,
            };
          })
        )
      : undefined;

    return {
      ...product,
      sellPrice: productPricing.displayPrice,
      pricing: productPricing,
      ...(pricedVariants ? { variants: pricedVariants } : {}),
    };
  }
}

export const pricingService = new PricingService();
