import mongoose from 'mongoose';
import { env } from './src/config/env';
import { Product } from './src/models/Product.model';
import { Category } from './src/models/Category.model';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('🌱 Connecting to DB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Fetch categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('⚠️ No categories found. Start the app first to seed categories!');
      process.exit(1);
    }

    const getCatId = (name: string) => {
      const cat = categories.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
      return cat ? cat._id : categories[0]._id;
    };

    const dummyProducts = [
      // 📱 Smartphones
      {
        title: 'VoltEdge Pro Max 5G - Titanium',
        description: 'The ultimate flagship smartphone with a 200MP camera system, 120Hz LTPO display, and all-day battery life.',
        category: getCatId('smartphones'),
        price: 119999,
        salePrice: 109999,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['flagship', '5g', 'titanium', 'featured'],
        cjProductId: 'dummy-phone-1',
        attributes: { brand: 'VoltEdge', color: 'Titanium' },
      },
      {
        title: 'VoltEdge Fold 3 - Phantom Black',
        description: 'Next-generation folding smartphone with a seamless 8-inch inner display and ultra-thin glass.',
        category: getCatId('smartphones'),
        price: 149999,
        salePrice: 145999,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1621330396167-a41436323cf1?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['foldable', 'premium', 'new'],
        cjProductId: 'dummy-phone-2',
        attributes: { brand: 'VoltEdge', color: 'Phantom Black' },
      },
      {
        title: 'Nexus X1 Ultra',
        description: 'Photography powerhouse featuring a 1-inch sensor and Leica optics.',
        category: getCatId('smartphones'),
        price: 89999,
        salePrice: 84999,
        stock: 120,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['camera', 'flagship'],
        cjProductId: 'dummy-phone-3',
        attributes: { brand: 'Nexus', color: 'White' },
      },
      {
        title: 'Nova Z Flip',
        description: 'Compact flip phone that fits perfectly in your pocket, featuring a customizable cover screen.',
        category: getCatId('smartphones'),
        price: 79999,
        salePrice: 74999,
        stock: 60,
        images: ['https://images.unsplash.com/photo-1605236453806-6ff3685e226e?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['flip', 'compact', 'trending'],
        cjProductId: 'dummy-phone-4',
        attributes: { brand: 'Nova', color: 'Purple' },
      },
      {
        title: 'PixelCore 8a',
        description: 'Pure Android experience with unmatched computational photography and AI features.',
        category: getCatId('smartphones'),
        price: 45999,
        salePrice: 39999,
        stock: 200,
        images: ['https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['budget', 'camera', 'ai'],
        cjProductId: 'dummy-phone-5',
        attributes: { brand: 'PixelCore', color: 'Charcoal' },
      },

      // 💻 Laptops
      {
        title: 'AuraBook Pro 16" - M3 Max',
        description: 'Unleash your creativity with the AuraBook Pro. Featuring a stunning Liquid Retina display and 64GB Unified Memory.',
        category: getCatId('laptops'),
        price: 249999,
        salePrice: 239999,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['laptop', 'pro', 'm3', 'featured'],
        cjProductId: 'dummy-laptop-1',
        attributes: { brand: 'Aura', size: '16 inch' },
      },
      {
        title: 'Zenith Blade 15 Gaming Laptop',
        description: 'RTX 4080 graphics, 240Hz OLED display, and liquid metal cooling. The ultimate portable gaming station.',
        category: getCatId('laptops'),
        price: 189999,
        salePrice: 179999,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['gaming', 'rtx4080', 'trending'],
        cjProductId: 'dummy-laptop-2',
        attributes: { brand: 'Zenith', refreshRate: '240Hz' },
      },
      {
        title: 'AuraBook Air 13"',
        description: 'Incredibly thin and light, powered by the M2 chip. Fanless design for silent operation.',
        category: getCatId('laptops'),
        price: 99999,
        salePrice: 89999,
        stock: 80,
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['ultrabook', 'lightweight', 'student'],
        cjProductId: 'dummy-laptop-3',
        attributes: { brand: 'Aura', size: '13 inch' },
      },
      {
        title: 'ThinkCore X1 Carbon Gen 11',
        description: 'The executive standard. Ultralight carbon fiber chassis, legendary keyboard, and vPro security.',
        category: getCatId('laptops'),
        price: 159999,
        salePrice: 144999,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['business', 'carbon', 'professional'],
        cjProductId: 'dummy-laptop-4',
        attributes: { brand: 'ThinkCore', material: 'Carbon Fiber' },
      },

      // 🎧 Audio
      {
        title: 'SonicBuds Active Noise Cancelling',
        description: 'Immersive spatial audio with dynamic head tracking. Up to 30 hours of listening time.',
        category: getCatId('audio'),
        price: 24999,
        salePrice: 19999,
        stock: 150,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['earbuds', 'anc', 'wireless'],
        cjProductId: 'dummy-audio-1',
        attributes: { brand: 'Sonic', type: 'In-Ear' },
      },
      {
        title: 'BassHead Studio Pro Over-Ear',
        description: 'Audiophile-grade wireless headphones with lossless audio support and plush leather earcups.',
        category: getCatId('audio'),
        price: 34999,
        salePrice: 29999,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['headphones', 'audiophile', 'over-ear', 'featured'],
        cjProductId: 'dummy-audio-2',
        attributes: { brand: 'BassHead', type: 'Over-Ear' },
      },
      {
        title: 'EchoBeam Soundbar 5.1.2',
        description: 'Cinematic Dolby Atmos soundbar with wireless subwoofer and rear surround speakers.',
        category: getCatId('audio'),
        price: 49999,
        salePrice: 42999,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1545454675-a6a61fa25d30?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['soundbar', 'hometheater', 'dolby'],
        cjProductId: 'dummy-audio-3',
        attributes: { brand: 'EchoBeam', channels: '5.1.2' },
      },
      {
        title: 'Vibe Bluetooth Speaker (Waterproof)',
        description: 'Rugged, portable Bluetooth speaker with 360-degree sound and IP67 water/dust resistance.',
        category: getCatId('audio'),
        price: 9999,
        salePrice: 7999,
        stock: 200,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['speaker', 'portable', 'waterproof'],
        cjProductId: 'dummy-audio-4',
        attributes: { brand: 'Vibe', rating: 'IP67' },
      },
      {
        title: 'AuraPods Max',
        description: 'High-fidelity audio. Active Noise Cancellation with Transparency mode. Stunning aluminum design.',
        category: getCatId('audio'),
        price: 59999,
        salePrice: 54999,
        stock: 35,
        images: ['https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['premium', 'headphones', 'anc'],
        cjProductId: 'dummy-audio-5',
        attributes: { brand: 'Aura', material: 'Aluminum' },
      },

      // ⌚ Smartwatches
      {
        title: 'Chrono Series 9 - Stainless Steel',
        description: 'Advanced health tracking, ECG app, and a brighter Always-On display.',
        category: getCatId('watches'),
        price: 45999,
        salePrice: 41999,
        stock: 75,
        images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['smartwatch', 'health', 'fitness'],
        cjProductId: 'dummy-watch-1',
        attributes: { brand: 'Chrono', material: 'Stainless Steel' },
      },
      {
        title: 'Chrono Ultra (Titanium/Orange Band)',
        description: 'Rugged titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.',
        category: getCatId('watches'),
        price: 89999,
        salePrice: 85999,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['smartwatch', 'ultra', 'rugged', 'trending'],
        cjProductId: 'dummy-watch-2',
        attributes: { brand: 'Chrono', case: 'Titanium' },
      },
      {
        title: 'FitPro Venu 3',
        description: 'Comprehensive fitness watch with advanced sleep coaching, AMOLED display, and built-in speaker/mic.',
        category: getCatId('watches'),
        price: 34999,
        salePrice: 32999,
        stock: 85,
        images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['fitness', 'amoled', 'health'],
        cjProductId: 'dummy-watch-3',
        attributes: { brand: 'FitPro', type: 'Fitness Tracker' },
      },

      // 🎮 Gaming
      {
        title: 'NexusStation 5 Pro',
        description: 'Next-gen console with ultra-high speed SSD, ray tracing, and 4K 120fps support.',
        category: getCatId('gaming'),
        price: 49999,
        salePrice: 49999,
        stock: 5, // Low stock!
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['console', 'nextgen', '4k'],
        cjProductId: 'dummy-game-1',
        attributes: { brand: 'Nexus', storage: '1TB SSD' },
      },
      {
        title: 'GamePad Elite Wireless Controller',
        description: 'Pro-level controller with adjustable tension thumbsticks, wrap-around rubberized grip, and shorter hair trigger locks.',
        category: getCatId('gaming'),
        price: 15999,
        salePrice: 12999,
        stock: 60,
        images: ['https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['controller', 'pro', 'wireless'],
        cjProductId: 'dummy-game-2',
        attributes: { brand: 'Nexus', type: 'Gamepad' },
      },
      {
        title: 'VR Vision Headset (256GB)',
        description: 'Standalone virtual reality headset with completely wire-free movement and high-res displays.',
        category: getCatId('gaming'),
        price: 39999,
        salePrice: 35999,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['vr', 'metaverse', 'gaming'],
        cjProductId: 'dummy-game-3',
        attributes: { brand: 'Vision', storage: '256GB' },
      },
      {
        title: 'HyperX Mechanical Gaming Keyboard',
        description: 'Aircraft-grade aluminum body, tactile RGB switches, and detachable wrist rest.',
        category: getCatId('gaming'),
        price: 12999,
        salePrice: 9999,
        stock: 110,
        images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['keyboard', 'rgb', 'mechanical'],
        cjProductId: 'dummy-game-4',
        attributes: { brand: 'HyperX', switches: 'Tactile' },
      },
      
      // 📸 Cameras & Drones
      {
        title: 'Alpha 7 IV Mirrorless Camera',
        description: '33MP full-frame sensor, 4K 60p video, and real-time Eye AF for humans, animals, and birds.',
        category: getCatId('camera'),
        price: 219999,
        salePrice: 209999,
        stock: 12,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['camera', 'mirrorless', 'photography'],
        cjProductId: 'dummy-cam-1',
        attributes: { brand: 'Alpha', sensor: 'Full-Frame' },
      },
      {
        title: 'SkyRider Mini 3 Pro Drone',
        description: 'Sub-250g folding drone with 4K HDR video, obstacle sensing, and true vertical shooting.',
        category: getCatId('camera'),
        price: 74999,
        salePrice: 69999,
        stock: 35,
        images: ['https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['drone', 'aerial', '4k', 'trending'],
        cjProductId: 'dummy-cam-2',
        attributes: { brand: 'SkyRider', weight: '249g' },
      },
      
      // 🔌 Accessories
      {
        title: 'MagCharge 3-in-1 Wireless Stand',
        description: 'Simultaneously charge your phone, watch, and earbuds with strong magnetic alignment.',
        category: getCatId('accessories'),
        price: 4999,
        salePrice: 3499,
        stock: 300,
        images: ['https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['charger', 'wireless', 'magsafe'],
        cjProductId: 'dummy-acc-1',
        attributes: { brand: 'VoltEdge', output: '15W' },
      },
      {
        title: 'Ultra-Fast 100W GaN Charger',
        description: 'Compact 4-port wall charger capable of charging two laptops simultaneously.',
        category: getCatId('power'),
        price: 3999,
        salePrice: 2999,
        stock: 250,
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['charger', 'gan', 'fast-charge'],
        cjProductId: 'dummy-acc-2',
        attributes: { brand: 'VoltEdge', power: '100W' },
      },
      {
        title: 'Armor Case for VoltEdge Fold 3',
        description: 'Military-grade drop protection with a built-in kickstand and S-Pen holder.',
        category: getCatId('accessories'),
        price: 1999,
        salePrice: 1499,
        stock: 500,
        images: ['https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&q=80&w=1000'],
        status: 'active',
        tags: ['case', 'protection'],
        cjProductId: 'dummy-acc-3',
        attributes: { brand: 'ArmorTech', compatibility: 'Fold 3' },
      }
    ];

    // Wipe existing products
    await Product.deleteMany({});
    console.log('🗑️  Wiped existing products');

    const mappedProducts = dummyProducts.map(p => ({
      ...p,
      costPrice: Math.floor(p.salePrice * 0.7)
    }));

    await Product.insertMany(mappedProducts);
    console.log(`✅ Seeded ${dummyProducts.length} premium products successfully!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
