'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { trackOrder, getTenantTheme } from '@/lib/api';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { Search, Truck, CheckCircle2, Package, Clock, ArrowLeft } from 'lucide-react';

export default function TrackOrderPage() {
  const [currentTenantSlug, setCurrentTenantSlug] = useState('aura-beauty');
  const [orderNumber, setOrderNumber] = useState('AUR-1001');
  const [phone, setPhone] = useState('9876543210');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await trackOrder(currentTenantSlug, orderNumber, phone);
      setTrackingData(res);
    } catch (err: any) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'PACKED', label: 'Packed at Warehouse', icon: Package },
    { key: 'SHIPPED', label: 'Shipped via Courier', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header
        theme={null}
        cartCount={0}
        onOpenCart={() => setIsCartOpen(true)}
        currentTenantSlug={currentTenantSlug}
        onSwitchTenant={(slug) => setCurrentTenantSlug(slug)}
      />

      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>

        <div className="glass-panel p-8 space-y-6">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-white">Track Your Order</h1>
            <p className="text-xs text-gray-400 mt-1">Enter your Order Number and WhatsApp Phone Number</p>
          </div>

          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Order No (e.g. AUR-1001)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white uppercase"
            />
            <input
              type="tel"
              placeholder="WhatsApp Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white"
            />
            <button type="submit" disabled={loading} className="gradient-btn font-bold text-xs uppercase tracking-wider py-3 rounded-lg">
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          {trackingData && (
            <div className="pt-6 border-t border-white/10 space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block">Order Number</span>
                  <span className="font-bold text-white text-sm">{trackingData.orderNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Current Status</span>
                  <span className="font-bold text-emerald-400 uppercase text-xs">{trackingData.fulfillmentStatus}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const isDone = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(trackingData.fulfillmentStatus) >= idx;
                  return (
                    <div key={s.key} className={`flex flex-col items-center space-y-2 ${isDone ? 'text-emerald-400' : 'text-gray-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDone ? 'border-emerald-400 bg-emerald-500/20' : 'border-white/10 bg-white/5'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold">{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {trackingData.trackingAwb && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-gray-300">
                  <p>Courier: <b>{trackingData.trackingCourier || 'Shiprocket Express'}</b></p>
                  <p>AWB Tracking ID: <b className="text-white">{trackingData.trackingAwb}</b></p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer theme={null} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={[]}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
        currentTenantSlug={currentTenantSlug}
      />
    </div>
  );
}
