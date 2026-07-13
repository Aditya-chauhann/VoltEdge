'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  AED: number;
}

interface SettingsState {
  selectedCurrency: Currency;
  currencyRates: CurrencyRates;
  minimumOrderAmount: number;
  isLoading: boolean;
  
  setCurrency: (currency: Currency) => void;
  fetchConfig: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedCurrency: 'INR',
      currencyRates: {
        USD: 83.33,
        EUR: 90.90,
        GBP: 105.26,
        AED: 22.68,
      },
      minimumOrderAmount: 50000,
      isLoading: false,

      setCurrency: (currency) => set({ selectedCurrency: currency }),

      fetchConfig: async () => {
        set({ isLoading: true });
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/config/public`);
          if (res.data?.success && res.data?.data) {
            set({
              minimumOrderAmount: res.data.data.minimumOrderAmount,
              currencyRates: res.data.data.currencyRates,
            });
          }
        } catch (error) {
          console.error('Failed to fetch public config', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'voltedge-settings',
      partialize: (state) => ({ selectedCurrency: state.selectedCurrency }), // Only persist user choice
    }
  )
);
