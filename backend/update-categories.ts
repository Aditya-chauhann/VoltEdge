import mongoose from 'mongoose';
import { env } from './src/config/env';
import { Category } from './src/models/Category.model';

const categoryMap: Record<string, string> = {
  'smartphone': 'F9AAF742-3A67-4887-BFBE-CF16B08910CF',
  'laptop': '7ECEEABC-0396-411D-969A-8F69CC7369E5',
  'headphone': 'DC11C779-CCD5-429C-9A93-F638456E745B',
  'smartwatch': '6A03FBB1-F7D9-441F-B06D-EF45CA87B553',
  'gaming': '997DBFF0-627C-4397-80D3-C12EA3906969',
  'camera': '85E0D3B7-C3C4-4F1B-98A6-958389A1BEBE',
  'smart home': '4BFAF763-DD09-4DD3-A7E9-E03724D1D51B', // Home Audio & Video
  'drone': '85E0D3B7-C3C4-4F1B-98A6-958389A1BEBE', // Camera & Photo
  'bluetooth speaker': '4BFAF763-DD09-4DD3-A7E9-E03724D1D51B',
  'phone case': '9FA474CF-E06D-4708-AD56-F39FED7F88E3', // Cases & Covers
  'tablet': '7ECEEABC-0396-411D-969A-8F69CC7369E5',
  'charger': '30063684-45E2-4929-BB85-441C1DF80DDE', // Accessories
  'streaming device': 'DC11C779-CCD5-429C-9A93-F638456E745B'
};

(async () => {
  await mongoose.connect(env.MONGODB_URI);
  
  for (const [slug, id] of Object.entries(categoryMap)) {
    await Category.updateOne({ slug }, { cjKeyword: id });
    console.log(`Updated ${slug} -> CJ ID: ${id}`);
  }
  
  console.log('✅ Categories mapped successfully!');
  process.exit(0);
})();
