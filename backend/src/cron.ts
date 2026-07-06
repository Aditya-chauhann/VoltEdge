import cron from 'node-cron';
import { productSyncService } from './services/productSync.service';
import { logger } from './utils/logger';

// Schedule the product sync to run every hour
cron.schedule('0 * * * *', async () => {
  logger.info('Starting scheduled product sync from CJ Dropshipping...');
  try {
    const result = await productSyncService.syncProductsFromCJ();
    logger.info(`Scheduled product sync completed. Synced ${result.totalSynced} products.`);
  } catch (error) {
    logger.error('Scheduled product sync failed', error);
  }
});

logger.info('Cron jobs initialized');
