'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, Zap, Star, ChevronLeft,
  Package, Shield, RotateCcw, Share2, Check,
} from 'lucide-react';
import { productsApi, reviewsApi, getApiError } from '@/lib/api';
import { Product, Review } from '@/types';
import { formatPrice, formatDate, discountPct } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import SkeletonCard from '@/components/ui/SkeletonCard';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const id       = params.id;

  const { isLoggedIn } = useAuthStore();
  const { addItem }    = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { openAuthModal } = useUIStore();

  const [product,      setProduct]      = useState<Product | null>(null);
  const [related,      setRelated]      = useState<Product[]>([]);
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [selectedImg,  setSelectedImg]  = useState(0);
  const [selectedVar,  setSelectedVar]  = useState<string>('');
  const [qty,          setQty]          = useState(1);
  const [addedToCart,  setAddedToCart]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isAdding,     setIsAdding]     = useState(false);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [zoomStyle,    setZoomStyle]    = useState({ transformOrigin: 'center center', transform: 'scale(1)' });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          productsApi.get(id),
          reviewsApi.get(id, { limit: '5' }),
        ]);
        const p: Product = pRes.data.data;
        setProduct(p);
        setReviews(rRes.data.data.reviews);

        // Fetch related products from same category
        if (p.category) {
          const catSlug = typeof p.category === 'object' ? p.category.slug : '';
          if (catSlug) {
            const relRes = await productsApi.getByCategory(catSlug, { limit: '5' });
            setRelated(relRes.data.data.products.filter((r: Product) => r._id !== id).slice(0, 4));
          }
        }
      } catch (err) {
        console.error(getApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isLoggedIn) {
      openAuthModal('login', { productId: product._id, qty, variantId: selectedVar || undefined });
      return;
    }
    setIsAdding(true);
    await addItem(product._id, qty, selectedVar || undefined);
    setIsAdding(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!isLoggedIn) {
      openAuthModal('login', { productId: product._id, qty });
      return;
    }
    await addItem(product._id, qty, selectedVar || undefined);
    router.push('/checkout');
  };

  const handleShare = () => {
    navigator.share?.({ title: product?.title, url: window.location.href })
      .catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!');
      });
  };

  if (isLoading) return <PageLoader />;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-2xl font-display text-white mb-4">Product not found</p>
      <button onClick={() => router.push('/products')} className="btn-primary">Browse Products</button>
    </div>
  );

  const inWishlist = isInWishlist(product._id);
  const discount   = discountPct(product.price, product.salePrice);
  const inStock    = product.stock > 0;
  const images     = product.images.length > 0 ? product.images : ['/placeholder-product.png'];

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* ── Images ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Main image */}
          <div 
            className="aspect-square bg-base-100 rounded-3xl overflow-hidden glass-card cursor-crosshair relative group"
            onClick={() => setIsModalOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.img
              key={selectedImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[selectedImg]}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-75 ease-out"
              style={zoomStyle}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
            />
            {/* Optional hint overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] group-hover:shadow-[inset_0_0_50px_rgba(0,0,0,0.3)] transition-shadow"></div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    idx === selectedImg ? 'border-primary-400' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {discount > 0 && <span className="badge bg-danger text-white">-{discount}% OFF</span>}
            {product.isNewArrival  && <span className="badge bg-success text-white">New Arrival</span>}
            {product.isBestSeller  && <span className="badge bg-warning text-black">🔥 Bestseller</span>}
            {!inStock && <span className="badge bg-gray-600 text-gray-200">Out of Stock</span>}
          </div>

          {/* Brand */}
          {product.brand && <p className="text-sm font-medium text-primary-400 uppercase tracking-wide">{product.brand}</p>}

          {/* Title */}
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">
            {product.title}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16}
                    className={s <= Math.round(product.avgRating) ? 'text-gold fill-gold' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300 font-medium">{product.avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display font-black text-4xl text-white">{formatPrice(product.salePrice)}</span>
            {discount > 0 && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
            )}
            {discount > 0 && (
              <span className="text-success font-semibold text-sm">Save {formatPrice(product.price - product.salePrice)}</span>
            )}
          </div>

          {/* Variants */}
          {product.variants.filter(v => v.name && v.name !== 'Default').length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2 font-medium">Select Variant:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter(v => v.name && v.name !== 'Default').map((v) => (
                  <button
                    key={v.variantId}
                    onClick={() => setSelectedVar(v.variantId)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      selectedVar === v.variantId
                        ? 'border-primary-400 bg-primary-400/20 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-primary-400/50'
                    } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={v.stock === 0}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400 font-medium">Qty:</p>
            <div className="flex items-center gap-2 glass-card px-1 py-1 rounded-xl">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                −
              </button>
              <span className="w-8 text-center font-semibold text-white">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                +
              </button>
            </div>
            <p className="text-xs text-gray-500">{product.stock} in stock</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              whileTap={{ scale: 0.97 }}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
            >
              {isAdding ? (
                <span className="flex items-center gap-2">Adding...</span>
              ) : addedToCart ? (
                <span className="flex items-center gap-2 text-success"><Check size={18} /> Added!</span>
              ) : (
                <><ShoppingCart size={18} /> Add to Cart</>
              )}
            </motion.button>

            <motion.button
              onClick={handleBuyNow}
              disabled={!inStock}
              whileTap={{ scale: 0.97 }}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
            >
              <Zap size={18} /> Buy Now
            </motion.button>
          </div>

          {/* Wishlist + Share */}
          <div className="flex gap-3">
            <button
              onClick={() => isLoggedIn ? toggleWishlist(product._id) : openAuthModal('login')}
              className={`btn-ghost flex items-center gap-2 text-sm ${inWishlist ? 'text-danger' : ''}`}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
              {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <button onClick={handleShare} className="btn-ghost flex items-center gap-2 text-sm">
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Guarantee pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Package,   label: 'Free Shipping' },
              { icon: Shield,    label: 'Genuine Product' },
              { icon: RotateCcw, label: '7-Day Returns' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass-card p-3 flex flex-col items-center text-center gap-1">
                <Icon size={16} className="text-primary-400" />
                <p className="text-xs text-gray-300 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Specifications ────────────────────────────────────────── */}
      {product.specifications.length > 0 && (
        <section className="mb-12">
          <h2 className="section-heading mb-5">Specifications</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <tbody>
                {product.specifications.map((spec, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white/2' : ''}>
                    <td className="px-5 py-3 text-sm text-gray-400 font-medium w-1/3">{spec.key}</td>
                    <td className="px-5 py-3 text-sm text-gray-200">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Description ───────────────────────────────────────────── */}
      {product.description && (
        <section className="mb-12">
          <h2 className="section-heading mb-4">About This Product</h2>
          <div className="glass-card p-6 relative">
            <div
              className={`text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none transition-all duration-300 ${
                !isDescExpanded ? 'max-h-[300px] overflow-hidden' : ''
              }`}
              dangerouslySetInnerHTML={{ 
                // Remove all <img> tags, the "Product Image:" text, and convert newlines to <br/>
                __html: product.description
                          .replace(/<img[^>]*>/gi, '')
                          .replace(/Product Image:/gi, '')
                          .replace(/\n/g, '<br/>') 
              }}
            />
            {!isDescExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f1015] to-transparent pointer-events-none rounded-b-2xl"></div>
            )}
            <div className={`mt-4 text-center relative z-10 ${!isDescExpanded ? '-mt-6' : ''}`}>
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="px-6 py-2 rounded-full border border-primary-500/30 text-primary-400 font-medium hover:bg-primary-500/10 hover:border-primary-400 transition-all text-sm backdrop-blur-md"
              >
                {isDescExpanded ? 'Read Less' : 'Read More'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="mb-12">
          <h2 className="section-heading mb-5">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-white text-sm">{r.user.name}</p>
                    {r.isVerified && (
                      <span className="badge bg-success/20 text-success">✓ Verified Purchase</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={12} className={s <= r.rating ? 'text-gold fill-gold' : 'text-gray-600'} />
                  ))}
                </div>
                {r.title && <p className="font-semibold text-white text-sm mb-1">{r.title}</p>}
                <p className="text-sm text-gray-300">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Related products ──────────────────────────────────────── */}
      {related.length > 0 && (
        <section>
          <h2 className="section-heading mb-5">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Image Modal ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm">
          <div className="bg-base-100 w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden flex flex-col lg:flex-row shadow-2xl relative border border-white/10">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
            >
              ✕
            </button>
            
            {/* Main Modal Image */}
            <div className="flex-1 bg-black/30 p-8 flex items-center justify-center relative">
              <img 
                src={images[selectedImg]} 
                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                alt={product.title}
              />
            </div>
            
            {/* Sidebar Thumbnails */}
            <div className="w-full lg:w-[400px] bg-base-100/95 p-6 flex flex-col border-l border-white/5 overflow-y-auto no-scrollbar">
              <h3 className="text-lg font-display text-white mb-2 pr-8 leading-tight">{product.title}</h3>
              {product.variants.length > 0 && <p className="text-sm text-primary-400 mb-6 font-medium">Variant: {product.variants[0]?.name || ''}</p>}
              
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      idx === selectedImg ? 'border-primary-400 shadow-[0_0_15px_rgba(var(--primary-400),0.3)]' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
