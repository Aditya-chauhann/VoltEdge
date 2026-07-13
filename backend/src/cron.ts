import cron from 'node-cron';
import axios from 'axios';
import { logger } from './utils/logger';
import { FinanceConfig } from './models/FinanceConfig.model';

// Run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Starting daily currency exchange rate sync...');
    const response = await axios.get('https://open.er-api.com/v6/latest/INR');
    
    if (response.data && response.data.rates) {
      const { USD, EUR, GBP, AED } = response.data.rates;
      
      let config = await FinanceConfig.findOne();
      if (!config) {
        config = await FinanceConfig.create({});
      }
      
      config.currencyRates = {
        USD: USD || config.currencyRates.USD,
        EUR: EUR || config.currencyRates.EUR,
        GBP: GBP || config.currencyRates.GBP,
        AED: AED || config.currencyRates.AED,
      };
      
      await config.save();
      logger.info('Currency rates successfully synced with API');
    }
  } catch (error) {
    logger.error('Failed to sync currency rates', error);
  }
});

logger.info('Cron jobs initialized');
