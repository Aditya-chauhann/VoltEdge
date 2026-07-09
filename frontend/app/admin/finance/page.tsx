'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, getApiError } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, Percent, DollarSign, Calculator } from 'lucide-react';

export default function AdminFinancePage() {
  const [config, setConfig] = useState({
    platformMarginPercent: 20,
    taxRatePercent: 18,
    paymentGatewayFeePercent: 2,
    fixedGatewayFeeInr: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await adminApi.financeConfig();
      setConfig(res.data.data);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateFinance(config);
      toast.success('Finance config updated successfully');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Finance & Fees Configuration</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
           <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
               <Calculator className="text-primary-500" />
               Global Modifiers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Platform Margin</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.platformMarginPercent}
                      onChange={(e) => setConfig({ ...config, platformMarginPercent: parseFloat(e.target.value) })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                    <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Added to CJ Dropshipping product costs to calculate retail price.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tax Rate (GST)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.taxRatePercent}
                      onChange={(e) => setConfig({ ...config, taxRatePercent: parseFloat(e.target.value) })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                    <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Standard GST rate applied to orders.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Payment Gateway Fee (Percentage)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.paymentGatewayFeePercent}
                      onChange={(e) => setConfig({ ...config, paymentGatewayFeePercent: parseFloat(e.target.value) })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                    <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Razorpay percentage deduction (approx 2%).</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Payment Gateway Fee (Fixed)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.fixedGatewayFeeInr}
                      onChange={(e) => setConfig({ ...config, fixedGatewayFeeInr: parseFloat(e.target.value) })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
                    />
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Fixed fee in INR charged by Razorpay per transaction.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-900/10 border border-primary-500/20 rounded-xl p-6">
            <h4 className="text-primary-400 font-medium mb-2">How Pricing is Calculated</h4>
            <div className="text-sm text-gray-400 space-y-2 font-mono bg-gray-950 p-4 rounded-lg border border-gray-900">
               <p>Base Cost = CJ Product Cost + CJ Shipping</p>
               <p>Retail Price = Base Cost * (1 + Platform Margin)</p>
               <p>Final Price = Retail Price * (1 + Tax Rate)</p>
            </div>
            <p className="text-xs text-primary-500 mt-4">Note: Changing these values will only affect new products imported or synced from CJ Dropshipping. Existing product prices in the database will remain unchanged until a manual re-sync.</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
