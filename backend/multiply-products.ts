import mongoose from 'mongoose';
import { env } from './src/config/env';
import { Product } from './src/models/Product.model';

(async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    const existing = await Product.find({}).lean();
    if (existing.length === 0) process.exit(0);
    
    const prefixes = ['Pro', 'Ultra', 'Max', 'Lite', 'Plus', 'SE', 'Elite', 'V2', 'Gen 2', 'Gen 3'];
    const colors = ['Midnight', 'Starlight', 'Space Gray', 'Silver', 'Obsidian', 'Snow', 'Rose Gold'];
    
    const newProducts = [];
    
    for (let i = 0; i < 4; i++) {
      for (const p of existing) {
        const clone = { ...p } as any;
        delete clone._id;
        delete clone.createdAt;
        delete clone.updatedAt;
        delete clone.__v;
        
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        clone.title = `${p.title.split(' - ')[0]} ${randomPrefix} - ${randomColor}`;
        clone.cjProductId = p.cjProductId + '-' + i + '-' + Math.random().toString(36).substring(7);
        
        // Randomize price by +/- 20%
        const multiplier = 0.8 + (Math.random() * 0.4);
        clone.salePrice = Math.floor(p.salePrice * multiplier);
        clone.price = Math.floor(clone.salePrice * 1.15); // MSRP is 15% more
        clone.costPrice = Math.floor(clone.salePrice * 0.7);
        
        // Randomize stock
        clone.stock = Math.floor(Math.random() * 200) + 10;
        
        newProducts.push(clone);
      }
    }
    
    await Product.insertMany(newProducts);
    console.log(`Added ${newProducts.length} more products! Total is now ${existing.length + newProducts.length}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
