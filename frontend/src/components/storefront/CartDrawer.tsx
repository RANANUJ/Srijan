'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';
import { validateCoupon } from '@/lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onUpdateQty: (productId: string, variantId: string | undefined, qty: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  currentTenantSlug: string;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQty, onRemoveItem, currentTenantSlug }: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = rawSubtotal >= 799 || rawSubtotal === 0 ? 0 : 70;
  const totalAmount = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  const freeShippingThreshold = 799;
  const progressPercent = Math.min(100, (rawSubtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    try {
      const res = await validateCoupon(currentTenantSlug, couponCode, rawSubtotal);
      setAppliedCoupon(res);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-[var(--background-color)] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="font-heading text-lg font-bold text-white">Your Shopping Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-3 bg-white/5 border-b border-white/5 text-xs">
          <div className="flex items-center justify-between mb-1 text-gray-300">
            <div className="flex items-center space-x-1">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>{rawSubtotal >= freeShippingThreshold ? '🎉 FREE Express Shipping Unlocked!' : `Add ₹${freeShippingThreshold - rawSubtotal} more for FREE shipping`}</span>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary-color)] to-emerald-400 h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-[var(--primary-color)]" />
              <p className="text-sm font-semibold">Your cart is empty</p>
              <p className="text-xs mt-1 text-gray-500">Explore our clean formulations & bestsellers!</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="glass-panel p-3.5 flex items-center space-x-3">
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80'} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                  {item.variantTitle && <span className="text-[10px] text-gray-400">{item.variantTitle}</span>}
                  <div className="text-xs font-bold text-[var(--primary-color)] mt-1">₹{item.price}</div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    <button onClick={() => onUpdateQty(item.productId, item.variantId, item.quantity - 1)} className="w-6 h-6 rounded bg-white/10 text-white font-bold text-xs hover:bg-white/20">-</button>
                    <span className="text-xs text-white font-semibold">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.productId, item.variantId, item.quantity + 1)} className="w-6 h-6 rounded bg-white/10 text-white font-bold text-xs hover:bg-white/20">+</button>
                  </div>
                </div>

                <button onClick={() => onRemoveItem(item.productId, item.variantId)} className="text-gray-500 hover:text-red-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Coupon & Summary Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-black/30 space-y-3">
            {/* Coupon Code Input */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Coupon code (e.g. GLOW20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white uppercase placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
              </div>
              <button onClick={handleApplyCoupon} className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg text-xs font-semibold">
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <div className="text-xs text-emerald-400 flex items-center justify-between bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                <span>Applied <b>{appliedCoupon.code}</b></span>
                <span>-₹{appliedCoupon.discountAmount}</span>
              </div>
            )}
            {couponError && <p className="text-xs text-red-400">{couponError}</p>}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-gray-300 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{rawSubtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-400">FREE</span> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="text-[var(--primary-color)]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Link
              href={`/checkout?tenant=${currentTenantSlug}`}
              onClick={() => {
                try {
                  localStorage.setItem('srijan_cart', JSON.stringify(items));
                  localStorage.setItem('srijan_coupon', appliedCoupon?.code || '');
                } catch {}
                onClose();
              }}
              className="w-full gradient-btn py-3 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl block"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
