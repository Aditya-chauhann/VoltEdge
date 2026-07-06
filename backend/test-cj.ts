import mongoose from 'mongoose';
import { env } from './src/config/env';
import { cjService } from './src/services/cjDropshipping.service';

(async () => {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Running manual CJ sync...');
  const result = await cjService.syncProducts();
  console.log('Result:', result);
  process.exit(0);
})();
