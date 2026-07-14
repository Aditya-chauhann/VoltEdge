'use client';
import { useSettingsStore } from '@/store/settingsStore';
import { formatPrice } from '@/lib/utils';
import { Info } from 'lucide-react';

export default function TopBanner() {
  const { minimumOrderAmount } = useSettingsStore();
  
  // Format the price based on the selected currency
  const formattedMinOrder = formatPrice(minimumOrderAmount);

  // We repeat the text to make the marquee seamless
  const text = `🚀 Important: The minimum wholesale order value is ${formattedMinOrder}. Enjoy bulk discounts on all products!`;

  return (
    <div className="bg-primary-600 dark:bg-primary-500 text-white py-1.5 overflow-hidden flex whitespace-nowrap relative z-[45] text-xs sm:text-sm font-medium w-full">
      <div className="animate-marquee inline-block min-w-max">
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
        <span className="mx-8">{text}</span>
      </div>
    </div>
  );
}
