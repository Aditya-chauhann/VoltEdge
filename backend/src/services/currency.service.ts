import { logger } from '../utils/logger';

class CurrencyService {
  private inrRate: number = 84.0; // Fallback rate
  private lastFetchTime: number = 0;
  private cacheDuration: number = 1000 * 60 * 60; // 1 hour

  async getUsdToInrRate(): Promise<number> {
    const now = Date.now();
    if (now - this.lastFetchTime < this.cacheDuration) {
      return this.inrRate;
    }

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response.ok) {
        const data: any = await response.json();
        if (data && data.rates && data.rates.INR) {
          this.inrRate = data.rates.INR;
          this.lastFetchTime = now;
          logger.info(`Updated USD to INR exchange rate: ${this.inrRate}`);
        }
      }
    } catch (error) {
      logger.error('Failed to fetch exchange rate, using cached/fallback rate', error);
    }

    return this.inrRate;
  }
}

export const currencyService = new CurrencyService();
