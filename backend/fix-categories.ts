import mongoose from 'mongoose';
import { env } from './src/config/env';
import { Category } from './src/models/Category.model';

const categoryMap: Record<string, string> = {
  'smartphone': 'F9AAF742-3A67-4887-BFBE-CF16B08910CF', // Mobile Phones
  'laptop': '7ECEEABC-0396-411D-969A-8F69CC7369E5', // Laptop & Tablets
  'headphone': 'DC11C779-CCD5-429C-9A93-F638456E745B', // Portable Audio & Video
  'smartwatch': '6A03FBB1-F7D9-441F-B06D-EF45CA87B553', // Smart Electronics
  'gaming': '997DBFF0-627C-4397-80D3-C12EA3906969', // Video Games
  'camera': '85E0D3B7-C3C4-4F1B-98A6-958389A1BEBE', // Camera & Photo
  'smart home': '4BFAF763-DD09-4DD3-A7E9-E03724D1D51B', // Home Audio & Video
  'drone': '85E0D3B7-C3C4-4F1B-98A6-958389A1BEBE', // Camera & Photo
  'bluetooth speaker': '4BFAF763-DD09-4DD3-A7E9-E03724D1D51B',
  'phone case': '9FA474CF-E06D-4708-AD56-F39FED7F88E3', // Cases & Covers
  'tablet': '7ECEEABC-0396-411D-969A-8F69CC7369E5',
  'power bank': '30063684-45E2-4929-BB85-441C1DF80DDE', // Accessories
  'streaming device': 'DC11C779-CCD5-429C-9A93-F638456E745B'
};

(async () => {
  await mongoose.connect(env.MONGODB_URI);
  
  for (const [keyword, id] of Object.entries(categoryMap)) {
    const result = await Category.updateOne({ cjKeyword: keyword }, { cjKeyword: id });
    if (result.modifiedCount > 0) {
      console.log(`✅ Updated Category (was ${keyword}) -> CJ ID: ${id}`);
    } else {
      console.log(`⚠️  Could not find category with cjKeyword=${keyword}`);
    }
  }
  
  console.log('✅ Categories mapped successfully!');
  process.exit(0);
})();
