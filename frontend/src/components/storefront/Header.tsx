'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, ShieldCheck, Sparkles, User, Truck, Phone, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  theme: any;
  cartCount: number;
  onOpenCart: () => void;
  currentTenantSlug: string;
  onSwitchTenant: (slug: string) => void;
}

export function Header({ theme, cartCount, onOpenCart, currentTenantSlug, onSwitchTenant }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0F19]/85 backdrop-blur-xl transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[var(--primary-color)] via-purple-700 to-[var(--secondary-color)] py-1.5 px-4 text-xs text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-semibold text-[11px] sm:text-xs">
              FESTIVE EXCLUSIVE: FLAT 20% OFF on all rituals | Code: <b>WELCOME20</b>
            </span>
          </div>

          {/* Show Operator Switcher ONLY in operator mode or fallback to customer trust banner */}
          <div className="flex items-center space-x-2 text-xs">
            {typeof window !== 'undefined' && window.location.search.includes('operator=true') ? (
              <div className="flex items-center space-x-1.5">
                <span className="opacity-75 hidden md:inline text-[11px]">Super-Admin View:</span>
                <select
                  value={currentTenantSlug}
                  onChange={(e) => onSwitchTenant(e.target.value)}
                  className="bg-black/50 border border-white/30 text-white rounded-lg px-2.5 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="aura-beauty">✨ Aura Beauty (Skincare & Peptides)</option>
                  <option value="veda-organics">🌿 Veda Organics (Authentic Ayurveda)</option>
                </select>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 text-[11px] text-white/90">
                <Truck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Free Express Shipping on orders &gt; ₹799</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group">
          {theme?.logo_url ? (
            <img
              src={theme.logo_url}
              alt={theme.brand_name}
              className="h-10 w-10 object-cover rounded-xl ring-2 ring-[var(--primary-color)]"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center font-bold text-white shadow-lg">
              {theme?.brand_name?.charAt(0) || 'S'}
            </div>
          )}
          <div>
            <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[var(--primary-color)] transition-colors">
              {theme?.brand_name || 'Brand Store'}
            </span>
            <div className="text-[10px] text-emerald-400 flex items-center space-x-1 font-medium">
              <ShieldCheck className="w-3 h-3 inline" />
              <span>Verified D2C Store</span>
            </div>
          </div>
        </Link>

        {/* Center Quick Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium text-gray-300">
          <a href="#catalog" className="hover:text-[var(--primary-color)] transition-colors">
            Bestsellers
          </a>
          <a href="#catalog" className="hover:text-[var(--primary-color)] transition-colors">
            Rituals & Bundles
          </a>
          <Link href="/track-order" className="hover:text-[var(--primary-color)] transition-colors">
            Track Order
          </Link>
          <Link href="/account" className="hover:text-[var(--primary-color)] transition-colors">
            My Account
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <Link
            href="/track-order"
            className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-300 hover:text-[var(--primary-color)] transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span className="hidden md:inline">Track</span>
          </Link>

          <Link
            href="/account"
            className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-300 hover:text-[var(--primary-color)] transition-colors font-medium"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Account</span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center space-x-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-full transition-colors font-semibold text-white shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin</span>
          </Link>

          {/* Cart Icon Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full bg-[var(--primary-color)]/15 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-all transform active:scale-95 shadow-md"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--secondary-color)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
