import { cjApiService } from './cjApi.service';
import { Product } from '../models/Product.model';
import { Category } from '../models/Category.model';
import { logger } from '../utils/logger';

export class ProductSyncService {
  async syncProductsFromCJ(): Promise<{ totalSynced: number }> {
    logger.info('Starting product synchronization from CJ Dropshipping...');
    
    // Get all active categories with CJ keywords
    const categories = await Category.find({ isActive: true, cjKeyword: { $ne: null } });
    let totalSynced = 0;

    for (const category of categories) {
      if (!category.cjKeyword) continue;
      
      let cjCategoryId: string | undefined;
      let cjSearchKeyword = category.cjKeyword;
      
      // Check if it's a UUID (CJ category ID format)
      if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(category.cjKeyword)) {
        cjCategoryId = category.cjKeyword;
        cjSearchKeyword = '';
      }

      logger.info(`Syncing category: ${category.name} (${category.cjKeyword})`);
      
      try {
        let page = 1;
        const maxPages = 10; // Fetch up to 1,000 products per category
        let hasMore = true;

        while (hasMore && page <= maxPages) {
          const result = await cjApiService.getProductList({
            page: page,
            limit: 100,
            keyword: cjSearchKeyword !== '' ? cjSearchKeyword : undefined,
            categoryId: cjCategoryId,
            sortBy: 'popular',
          });

          if (result && result.list && result.list.length > 0) {
            const bulkOps = result.list.map((cjProduct: any) => ({
              updateOne: {
                filter: { pid: cjProduct.pid },
                update: {
                  $set: {
                    pid: cjProduct.pid,
                    name: cjProduct.productName || cjProduct.productNameEn || cjProduct.pid,
                    sku: cjProduct.pid,
                    price: cjProduct.sellPrice || 0,
                    image: cjProduct.productImage || '',
                    categoryId: category._id.toString(),
                    categoryName: category.name,
                    description: cjProduct.description || '',
                    stock: 100,
                    isActive: true,
                  }
                },
                upsert: true
              }
            }));

            try {
              const bulkResult = await Product.bulkWrite(bulkOps, { ordered: false });
              const updatedCount = bulkResult.upsertedCount + bulkResult.modifiedCount;
              // If a document was matched but not modified (because data was identical), 
              // it's not counted in modifiedCount. So we can just say we processed them all.
              totalSynced += result.list.length; 
              logger.info(`Synced ${result.list.length} products for category ${category.name} (Page ${page})`);
            } catch (err) {
              logger.error(`Error during bulkWrite for category ${category.name}`, err);
            }
            page++;
            
            // Artificial delay to prevent rate limiting from CJ API
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            hasMore = false;
          }
        }
      } catch (err) {
        logger.error(`Error fetching products for category ${category.name}`, err);
      }
    }

    logger.info(`Product synchronization complete. Total products synced: ${totalSynced}`);
    return { totalSynced };
  }
}

export const productSyncService = new ProductSyncService();
