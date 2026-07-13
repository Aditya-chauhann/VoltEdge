'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, getApiError } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { AdminDrawer } from '@/components/ui/AdminDrawer';
import ReactQuillWrapper from '@/components/ui/ReactQuillWrapper';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'policies'>('banners');
  
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [refundPolicy, setRefundPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [savingPolicy, setSavingPolicy] = useState<'refund_shipping' | 'privacy' | null>(null);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    imageUrl: '',
    headline: '',
    subtext: '',
    buttonLabel: '',
    buttonLink: '',
    overlayDarkness: 50,
    isActive: true,
    order: 0,
  });

  const fetchBanners = async () => {
    try {
      const res = await adminApi.banners();
      setBanners(res.data.data);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const fetchPolicies = async () => {
    try {
      const refundRes = await adminApi.getPolicy('refund_shipping').catch(() => null);
      if (refundRes?.data?.data) setRefundPolicy(refundRes.data.data.content);

      const privacyRes = await adminApi.getPolicy('privacy').catch(() => null);
      if (privacyRes?.data?.data) setPrivacyPolicy(privacyRes.data.data.content);
    } catch (err) {
      console.error('Failed to fetch policies', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchBanners(), fetchPolicies()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      imageUrl: '',
      headline: '',
      subtext: '',
      buttonLabel: 'Shop Now',
      buttonLink: '/shop',
      overlayDarkness: 50,
      isActive: true,
      order: banners.length,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl,
      headline: banner.headline,
      subtext: banner.subtext,
      buttonLabel: banner.buttonLabel,
      buttonLink: banner.buttonLink,
      overlayDarkness: banner.overlayDarkness,
      isActive: banner.isActive,
      order: banner.order,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await adminApi.deleteBanner(id);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner._id, formData);
        toast.success('Banner updated');
      } else {
        await adminApi.createBanner(formData);
        toast.success('Banner created');
      }
      setIsDrawerOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleSavePolicy = async (type: 'refund_shipping' | 'privacy') => {
    setSavingPolicy(type);
    try {
      const content = type === 'refund_shipping' ? refundPolicy : privacyPolicy;
      await adminApi.updatePolicy(type, { content });
      toast.success(type === 'refund_shipping' ? 'Refund & Shipping Policy updated' : 'Privacy Policy updated');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSavingPolicy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'banners' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Homepage Banners
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'policies' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Policies (Legal)
        </button>
      </div>

      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Homepage Banners</h2>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Plus size={16} /> Add Banner
            </button>
          </div>

      {loading ? (
        <div className="flex justify-center py-12">
           <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
          <ImageIcon size={48} className="mb-4 opacity-20" />
          <p>No banners configured.</p>
          <p className="text-sm">Add a banner to display it on the homepage hero section.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div key={banner._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex group">
              {/* Drag Handle */}
              <div className="w-10 bg-gray-50 dark:bg-gray-950 flex items-center justify-center border-r border-gray-200 dark:border-gray-800 text-gray-600 cursor-move hover:text-gray-900 dark:text-white transition-colors">
                 <GripVertical size={16} />
              </div>
              
              {/* Preview */}
              <div className="w-64 h-32 relative bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shrink-0">
                <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black" style={{ opacity: banner.overlayDarkness / 100 }} />
                <div className="absolute inset-0 p-4 flex flex-col justify-center">
                  <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-tight line-clamp-2">{banner.headline}</h3>
                  <p className="text-gray-300 text-[10px] mt-1 line-clamp-1">{banner.subtext}</p>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${banner.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    {banner.isActive ? 'Active' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(banner)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                     <p className="text-xs text-gray-500 mb-1">Button</p>
                     <p className="text-sm text-gray-300 font-medium">{banner.buttonLabel}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 mb-1">Link</p>
                     <p className="text-sm text-primary-400 font-mono">{banner.buttonLink}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Refund & Shipping Policy</h2>
              <button
                onClick={() => handleSavePolicy('refund_shipping')}
                disabled={savingPolicy === 'refund_shipping'}
                className="btn-primary text-sm py-2 px-6"
              >
                {savingPolicy === 'refund_shipping' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <ReactQuillWrapper value={refundPolicy} onChange={setRefundPolicy} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Privacy Policy</h2>
              <button
                onClick={() => handleSavePolicy('privacy')}
                disabled={savingPolicy === 'privacy'}
                className="btn-primary text-sm py-2 px-6"
              >
                {savingPolicy === 'privacy' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <ReactQuillWrapper value={privacyPolicy} onChange={setPrivacyPolicy} />
          </div>
        </div>
      )}

      {/* Editor Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create Banner'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 bg-gray-50 dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Image URL (Unsplash/Cloudinary)</label>
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Headline</label>
              <input
                type="text"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Subtext</label>
              <input
                type="text"
                value={formData.subtext}
                onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Button Label</label>
                <input
                  type="text"
                  value={formData.buttonLabel}
                  onChange={(e) => setFormData({ ...formData, buttonLabel: e.target.value })}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Button Link</label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  placeholder="/category/smartphones"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex justify-between">
                <span>Overlay Darkness (0-100)</span>
                <span className="text-gray-900 dark:text-white">{formData.overlayDarkness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.overlayDarkness}
                onChange={(e) => setFormData({ ...formData, overlayDarkness: parseInt(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
               <input
                 type="checkbox"
                 checked={formData.isActive}
                 onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                 className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
               />
               <span className="text-sm font-medium text-gray-900 dark:text-white">Active (Display on Homepage)</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-500 text-gray-900 dark:text-white py-3 rounded-lg font-medium transition-colors"
            >
              Save Banner
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminDrawer>
    </div>
  );
}
