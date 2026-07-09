'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TrustBadges from '@/components/home/TrustBadges';
import TodaysDeals from '@/components/home/TodaysDeals';
import { TrendingSection, BestSellers, NewArrivals } from '@/components/home/TrendingSection';
import CategorySection from '@/components/home/CategorySection';
import NewsletterBanner from '@/components/home/NewsletterBanner';
import { productsApi, getApiError } from '@/lib/api';
import { Product, Category } from '@/types';

export default function HomePage() {
  const [trending,    setTrending]    = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [deals,       setDeals]       = useState<Product[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [banners,     setBanners]     = useState<any[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      try {
        const [trendRes, bestRes, newRes, catRes, bannerRes] = await Promise.all([
          productsApi.list({ trending: 'true', limit: '10', status: 'active' }),
          productsApi.list({ bestSeller: 'true', limit: '10', status: 'active' }),
          productsApi.list({ newArrival: 'true', limit: '10', status: 'active', sort: 'createdAt', order: 'desc' }),
          productsApi.getCategories(),
          productsApi.getBanners(),
        ]);

        setTrending(trendRes.data.data.products);
        setBestSellers(bestRes.data.data.products);
        setNewArrivals(newRes.data.data.products);
        setCategories(catRes.data.data);
        setBanners(bannerRes.data.data);

        // Use best sellers for "Today's Deals" (in a real app these would have specific deal flags)
        setDeals(bestRes.data.data.products.slice(0, 5));
      } catch (err) {
        console.error('Failed to load home page data:', getApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <>
      <HeroSection banners={banners} />
      <TrustBadges />
      <TodaysDeals products={deals} isLoading={isLoading} />
      <CategorySection categories={categories} />
      <TrendingSection products={trending} isLoading={isLoading} />
      <BestSellers products={bestSellers} isLoading={isLoading} />
      <NewArrivals products={newArrivals} isLoading={isLoading} />
      <NewsletterBanner />
    </>
  );
}
