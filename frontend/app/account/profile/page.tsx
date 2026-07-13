'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Plus, Trash2, MapPin, Edit3, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi, getApiError } from '@/lib/api';
import { Address } from '@/types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, updateUser, _hasHydrated } = useAuthStore();
  const [editingProfile, setEditingProfile] = useState(false);
  const [name,  setName]  = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState<Partial<Address>>({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false,
  });

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name, phone });
      updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditingProfile(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async () => {
    try {
      const res = await authApi.addAddress(addrForm);
      updateUser({ addresses: res.data.data });
      toast.success('Address added!');
      setShowAddrForm(false);
      setAddrForm({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await authApi.deleteAddress(id);
      updateUser({ addresses: res.data.data });
      toast.success('Address removed');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">My Profile</h1>

      {/* ── Profile info ─────────────────────────────────────────── */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="font-display font-bold text-2xl text-gray-900 dark:text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-display font-bold text-lg text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingProfile(!editingProfile); setName(user.name); setPhone(user.phone ?? ''); }}
            className="btn-ghost text-sm flex items-center gap-1.5"
          >
            <Edit3 size={14} /> Edit
          </button>
        </div>

        {editingProfile ? (
          <div className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="input-field pl-9"
              />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="input-field pl-9"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                <Check size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditingProfile(false)} className="btn-ghost text-sm py-2 px-4">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Email</p>
              <p className="text-gray-900 dark:text-white flex items-center gap-1.5"><Mail size={13} className="text-primary-400" />{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Phone</p>
              <p className="text-gray-900 dark:text-white flex items-center gap-1.5"><Phone size={13} className="text-primary-400" />{user.phone ?? '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Addresses ────────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white">Saved Addresses</h2>
          <button onClick={() => setShowAddrForm(!showAddrForm)} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Add address form */}
        {showAddrForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-5 bg-white dark:bg-base-100 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field col-span-2 text-sm" placeholder="Full name *" value={addrForm.fullName}
                onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} />
              <input className="input-field text-sm" placeholder="Phone *" value={addrForm.phone}
                onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
              <input className="input-field text-sm" placeholder="Pincode *" value={addrForm.pincode}
                onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} />
              <input className="input-field col-span-2 text-sm" placeholder="Address line 1 *" value={addrForm.line1}
                onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} />
              <input className="input-field col-span-2 text-sm" placeholder="Address line 2" value={addrForm.line2}
                onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} />
              <input className="input-field text-sm" placeholder="City *" value={addrForm.city}
                onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
              <input className="input-field text-sm" placeholder="State *" value={addrForm.state}
                onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={!!addrForm.isDefault}
                onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                className="accent-primary-400"
              />
              Set as default address
            </label>
            <div className="flex gap-2">
              <button onClick={addAddress} className="btn-primary text-sm py-2 px-4">Save Address</button>
              <button onClick={() => setShowAddrForm(false)} className="btn-ghost text-sm py-2 px-4">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Address list */}
        {user.addresses?.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">No addresses saved yet</p>
        ) : (
          <div className="space-y-3">
            {user.addresses?.map((addr) => (
              <div key={addr._id} className={`flex gap-4 p-4 rounded-xl border transition-all ${
                addr.isDefault ? 'border-primary-400/50 bg-primary-400/5' : 'border-gray-300 dark:border-gray-700'
              }`}>
                <MapPin size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{addr.fullName} {addr.isDefault && <span className="badge bg-primary-400/20 text-primary-400 ml-1">Default</span>}</p>
                  <p className="text-gray-600 dark:text-gray-400">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-gray-500 mt-0.5">{addr.phone}</p>
                </div>
                <button onClick={() => addr._id && deleteAddress(addr._id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
