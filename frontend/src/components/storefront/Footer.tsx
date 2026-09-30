'use client';

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock, MessageCircle, Award, CheckCircle2 } from 'lucide-react';

export function Footer({ theme }: { theme: any }) {
  const brandTitle = theme?.brand_name || 'Brand Store';

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/50 text-gray-300">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
        <div className="flex flex-col items-center space-y-2">
          <Truck className="w-6 h-6 text-[var(--primary-color)]" />
          <span className="font-semibold text-white">Express All India Delivery</span>
          <span className="text-gray-400">Free shipping on orders above ₹799</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <ShieldCheck className="w-6 h-6 text-[var(--accent-color)]" />
          <span className="font-semibold text-white">100% Authentic & Certified</span>
          <span className="text-gray-400">Directly from verified manufacturing units</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Lock className="w-6 h-6 text-[var(--secondary-color)]" />
          <span className="font-semibold text-white">Bank-Grade 256-Bit SSL</span>
          <span className="text-gray-400">PCI-DSS Level 1 compliant payments</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <MessageCircle className="w-6 h-6 text-emerald-400" />
          <span className="font-semibold text-white">WhatsApp Order Updates</span>
          <span className="text-gray-400">Live order status & courier notifications</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-heading text-xl font-bold text-white mb-3">{brandTitle}</h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Committed to uncompromising quality, transparent formulations, and exceptional Indian customer experience.
          </p>
          <div className="text-xs text-emerald-400 flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verified Independent D2C Enterprise</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Shop Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#catalog" className="hover:text-[var(--primary-color)] transition-colors">Bestselling Formulations</a></li>
            <li><a href="#catalog" className="hover:text-[var(--primary-color)] transition-colors">New Season Launches</a></li>
            <li><a href="#catalog" className="hover:text-[var(--primary-color)] transition-colors">Targeted Ritual Bundles</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Customer Support</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="/track-order" className="hover:text-[var(--primary-color)] transition-colors">Track Your Order</a></li>
            <li><a href="/account" className="hover:text-[var(--primary-color)] transition-colors">My Customer Account</a></li>
            <li><a href="#faq" className="hover:text-[var(--primary-color)] transition-colors">Shipping & 7-Day Returns</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Official Entity & GST</h4>
          <p className="text-xs text-gray-400 mb-1.5 font-medium text-white">{brandTitle} Lifestyle Pvt Ltd</p>
          <p className="text-xs text-gray-400 font-mono">GSTIN: 27AAAAA0000A1Z5</p>
          <p className="text-xs text-gray-400 mt-2">Central Fulfillment Hub, Mumbai, Maharashtra</p>
        </div>
      </div>

      <div className="border-t border-white/5 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {brandTitle}. All rights reserved. Encrypted with 256-Bit SSL Protection.
      </div>
    </footer>
  );
}
