import mongoose from 'mongoose';
import { env } from './src/config/env';

import { Product } from './src/models/Product.model';

(async () => {
  await mongoose.connect(env.MONGODB_URI);
  const res = await Product.deleteMany({ cjProductId: { $regex: /^dummyjson-/ } });
  console.log('Deleted duplicates:', res.deletedCount);
  process.exit(0);
})();
