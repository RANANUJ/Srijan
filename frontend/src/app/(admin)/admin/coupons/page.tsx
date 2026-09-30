'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFromApi, createCoupon } from '@/lib/api';
import { Tag, Plus, Check } from 'lucide-react';

export default function CouponsManagerPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('20');
  const [minOrderValue, setMinOrderValue] = useState('999');

  useEffect(() => {
    loadCoupons();
  }, [tenantSlug]);

  async function loadCoupons() {
    setLoading(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const data = await fetchFromApi('/admin/coupons', { tenantSlug, token });
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('srijan_token') || '';

    try {
      await createCoupon(tenantSlug, token, {
        code,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_value: Number(minOrderValue),
      });

      setShowModal(false);
      setCode('');
      loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
              <Tag className="w-6 h-6 text-blue-400" />
              <span>Coupons & Promotion Engine</span>
            </h1>
            <p className="text-xs text-gray-400">Create tenant-isolated coupon codes with usage limits</p>
          </div>

          <button onClick={() => setShowModal(true)} className="gradient-btn px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Create Coupon Code</span>
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-8 max-w-md w-full space-y-4">
              <h3 className="font-heading text-xl font-bold text-white">Create New Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Coupon Code</label>
                  <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. FESTIVE20" className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Discount Type</label>
                    <select value={discountType} onChange={(e: any) => setDiscountType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white">
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Discount Value</label>
                    <input type="number" required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Min Order Value (₹)</label>
                  <input type="number" required value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white" />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                  <button type="submit" className="gradient-btn px-4 py-2 text-xs font-bold uppercase tracking-wider">Save Coupon</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="glass-panel p-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading coupons...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                  <tr>
                    <th className="py-3">Code</th>
                    <th className="py-3">Discount</th>
                    <th className="py-3">Min Order</th>
                    <th className="py-3">Times Used</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-bold text-white font-mono">{c.code}</td>
                      <td className="py-3 font-bold text-emerald-400">{c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</td>
                      <td className="py-3">₹{c.min_order_value}</td>
                      <td className="py-3 font-black text-white">{c.used_count} times</td>
                      <td className="py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">{c.is_active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
