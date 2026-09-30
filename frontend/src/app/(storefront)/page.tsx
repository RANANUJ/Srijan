'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { LivePurchaseToast } from '@/components/storefront/LivePurchaseToast';
import { SkinQuizModal } from '@/components/storefront/SkinQuizModal';
import { getTenantTheme, getTenantProducts, trackAnalyticsEvent } from '@/lib/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Award,
  Star,
  CheckCircle2,
  Truck,
  RotateCcw,
  Instagram,
  Gem,
  Zap,
  Tag,
  FlameKindling,
  Diamond,
  Shirt,
  ShoppingBag,
  BadgeCheck,
  Layers,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Archetype helpers
// ──────────────────────────────────────────────────────────────────────────────
function detectArchetype(theme: any): string {
  if (!theme) return 'BEAUTY_FOXTALE';
  const cardStyle = theme.card_style || '';
  if (cardStyle.includes('organic') || cardStyle.includes('artisan')) return 'ORGANIC_GHARSOAPS';
  if (cardStyle.includes('fashion') || cardStyle.includes('minimalist')) return 'FASHION_PREMIUM';
  if (cardStyle.includes('gold') || cardStyle.includes('jewel')) return 'JEWELLERY_KALYAN';
  if (cardStyle.includes('marketplace') || cardStyle.includes('grid')) return 'MULTISTORE_NYKAA';
  return 'BEAUTY_FOXTALE';
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHETYPE 1: Beauty / Foxtale / Pilgrim
// ──────────────────────────────────────────────────────────────────────────────
function BeautyHero({ theme, onQuiz }: { theme: any; onQuiz: () => void }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
      {/* Glassmorphism ambient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] opacity-20 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] opacity-15 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--secondary-color) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-300">Clinically Validated · Dermatologist Approved · Cruelty-Free</span>
          </div>

          <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Luminous Clinical{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent block">
              Skin Science.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
            High-performance active botanicals with clinically validated peptides, niacinamide, and retinoids — tailored for South Asian skin. 100% paraben-free, fragrance-free.
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {['photo-1534528741775-53994a69daeb', 'photo-1517841905240-472988babdf9', 'photo-1507003211169-0a1dd7228f2d', 'photo-1544005313-94ddf0286df2'].map((p, i) => (
                <img key={i} className="w-9 h-9 rounded-full ring-2 ring-[var(--background-color)] object-cover"
                  src={`https://images.unsplash.com/${p}?w=100&auto=format&fit=crop&q=80`} alt="Customer" />
              ))}
            </div>
            <div>
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="text-white font-extrabold text-xs ml-1">4.9/5</span>
              </div>
              <p className="text-[11px] text-gray-400">Loved by 64,800+ Indian Shoppers</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#catalog" className="gradient-btn px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-2xl active:scale-95 transition-all rounded-xl">
              <span>Shop Rituals</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button onClick={onQuiz} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl flex items-center space-x-2 transition-all">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Take Skin Quiz</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 text-[11px] text-gray-400 border-t border-white/10 max-w-lg">
            <div className="flex items-center space-x-1.5"><Truck className="w-3.5 h-3.5 text-cyan-400" /><span>48h Fast Dispatch</span></div>
            <div className="flex items-center space-x-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /><span>Cash on Delivery</span></div>
            <div className="flex items-center space-x-1.5"><RotateCcw className="w-3.5 h-3.5 text-purple-400" /><span>7-Day Return</span></div>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden glass-panel p-2 shadow-2xl ring-1 ring-white/20 relative">
            <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80"
              alt="Beauty Brand Hero" className="w-full h-full object-cover rounded-2xl" />
            <div className="absolute top-6 -left-6 glass-panel p-3 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl animate-float max-w-[220px] text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clinical Result</span>
              </div>
              <p className="text-white font-semibold text-xs mt-1">98.4% noticed visible radiance in 14 days</p>
            </div>
            <div className="absolute bottom-6 -right-6 glass-panel p-3 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl animate-float max-w-[210px] text-xs" style={{ animationDelay: '2.5s' }}>
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px]">
                <Award className="w-4 h-4" />
                <span>Vogue Beauty Awards</span>
              </div>
              <p className="text-white font-semibold text-xs mt-0.5">Winner: Best Clean Indian D2C Brand 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHETYPE 2: Organic / Ghar Soaps — earthy artisan style
// ──────────────────────────────────────────────────────────────────────────────
function OrganicHero({ theme }: { theme: any }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-900/30">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d97706\' fill-opacity=\'0.5\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full border border-amber-600/40 bg-amber-900/20 text-xs font-bold text-amber-300">
            <Leaf className="w-3.5 h-3.5" />
            <span>100% Cold-Process · Handcrafted in Small Batches · Zero Preservatives</span>
          </div>

          <h1 className="font-heading text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
            Ancient Indian Soap <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
              Kala Namak Kesar.
            </span>
          </h1>

          <p className="text-sm text-gray-300 max-w-lg leading-relaxed">
            Cold-process sandalwood and saffron soaps handcrafted in copper vessels using century-old Vedic recipes. No sulphates, no SLS, zero plastic packaging.
          </p>

          {/* Trust Badges Row — like Ghar Soaps */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: '🌿', label: 'Cold-Process', sub: 'Hand-poured artisan' },
              { icon: '🌸', label: 'Sulphate-Free', sub: '0% SLS / SLES' },
              { icon: '🏺', label: 'Copper Vessel', sub: 'Vedic traditional method' },
              { icon: '♻️', label: 'Zero Plastic', sub: 'Kraft paper wrap only' },
            ].map((b, i) => (
              <div key={i} className="flex items-center space-x-2 bg-amber-900/20 border border-amber-700/30 rounded-xl px-3 py-2">
                <span className="text-base">{b.icon}</span>
                <div>
                  <div className="text-[10px] font-bold text-amber-300">{b.label}</div>
                  <div className="text-[9px] text-gray-400">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#catalog" className="gradient-btn px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 rounded-xl">
              <span>Shop Artisan Soaps</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-amber-700/30 shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1607602132700-068258431673?w=900&auto=format&fit=crop&q=80"
              alt="Artisan Organic Soap Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-6 right-6">
              <div className="bg-black/70 backdrop-blur-md border border-amber-600/30 rounded-2xl p-4 text-xs">
                <div className="text-amber-400 font-bold mb-1 text-[11px] uppercase tracking-wider">🏺 Small Batch Promise</div>
                <p className="text-gray-200 leading-relaxed">Each bar is poured by hand in batches of 48, cold-cured for 6 weeks for the richest lather.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHETYPE 3: Fashion / Premium — Zara / Masaba / FabIndia style
// ──────────────────────────────────────────────────────────────────────────────
function FashionHero({ theme }: { theme: any }) {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center border-b border-white/5">
      {/* Full bleed editorial background */}
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=85"
          alt="Fashion Editorial" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#05070B]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-2xl space-y-8">
          <div className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">
            New Season · SS 2026 Collection
          </div>

          <h1 className="font-heading text-6xl lg:text-8xl font-black text-white leading-[0.92] tracking-tighter">
            EFFORTLESS <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(197,168,128,0.8)' }}>LUXURY</span>
          </h1>

          <p className="text-sm text-gray-400 max-w-md leading-relaxed border-l-2 border-[#C5A880] pl-4">
            Handloomed Banarasi silks, block-printed Jaipur cottons, and modern structured silhouettes — the finest Indian luxury couture, made to last a lifetime.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#catalog" className="gradient-btn px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center space-x-3 rounded-none">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#catalog" className="border border-[#C5A880]/50 text-[#C5A880] hover:bg-[#C5A880]/10 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all">
              Lookbook 2026
            </a>
          </div>

          <div className="flex items-center space-x-8 text-[11px] text-gray-400 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2"><Shirt className="w-4 h-4 text-[#C5A880]" /><span>Handloomed Pure Silk</span></div>
            <div className="flex items-center space-x-2"><BadgeCheck className="w-4 h-4 text-[#C5A880]" /><span>GI-Certified Weaves</span></div>
            <div className="flex items-center space-x-2"><Truck className="w-4 h-4 text-[#C5A880]" /><span>Free Shipping ₹1999+</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHETYPE 4: Jewellery / Kalyan — luxury gold style
// ──────────────────────────────────────────────────────────────────────────────
function JewelleryHero({ theme }: { theme: any }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-900/20">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #F59E0B 0%, transparent 60%)' }} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-7">
          <div className="flex items-center space-x-3">
            <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-400">Established 1908 · Pure Gold Artisans</span>
            <div className="h-px w-12 bg-gradient-to-l from-amber-400 to-transparent" />
          </div>

          <h1 className="font-heading text-5xl lg:text-6xl font-extrabold text-white leading-[1.05]">
            Where Every Piece <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Tells a Legacy.
            </span>
          </h1>

          <p className="text-sm text-gray-300 max-w-lg leading-relaxed">
            BIS Hallmarked 916 gold jewellery, IGI-certified natural diamonds, and Kashmirian saffron-glazed temple motifs — crafted by karigars whose families have served royals for 6 generations.
          </p>

          {/* Purity certification badges */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '⚜️', label: 'BIS Hallmarked 916', sub: 'Government certified pure gold' },
              { icon: '💎', label: 'IGI / GIA Certified', sub: 'Conflict-free natural diamonds' },
              { icon: '🔏', label: 'Tamper-Proof Seal', sub: 'Lifetime purity guarantee' },
              { icon: '🏅', label: 'Karigars Guild', sub: '6-generation master craftsmen' },
            ].map((b, i) => (
              <div key={i} className="flex items-center space-x-3 bg-amber-900/10 border border-amber-700/20 rounded-xl p-3">
                <span className="text-xl">{b.icon}</span>
                <div>
                  <div className="text-[11px] font-bold text-amber-300">{b.label}</div>
                  <div className="text-[10px] text-gray-400">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#catalog" className="gradient-btn px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 rounded-xl shadow-2xl shadow-amber-500/20">
              <Gem className="w-4 h-4" />
              <span>View Collections</span>
            </a>
            <a href="#catalog" className="border border-amber-600/30 text-amber-400 hover:bg-amber-900/20 px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
              Book Home Trial
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-amber-700/30 shadow-2xl relative">
            <img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&auto=format&fit=crop&q=80"
              alt="Fine Jewellery Collection" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
            <div className="absolute top-6 -right-4 bg-black/80 backdrop-blur-md border border-amber-600/40 rounded-2xl p-4 text-xs max-w-[180px]">
              <div className="text-amber-400 font-bold text-[10px] mb-1">⚜️ Purity Certificate</div>
              <div className="text-white font-bold text-lg">22K / 916</div>
              <div className="text-gray-400 text-[10px]">BIS Hallmarked · Govt. Approved</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHETYPE 5: Multi-Store Marketplace — Nykaa / Flipkart style
// ──────────────────────────────────────────────────────────────────────────────
function MarketplaceHero({ theme }: { theme: any }) {
  const categories = ['Beauty & Skin', 'Hair Care', 'Wellness', 'Fashion', 'Home & Living', 'Electronics', 'Sports', 'Baby & Kids'];
  return (
    <section className="border-b border-white/10">
      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 py-2.5 px-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs font-bold text-white">
          <FlameKindling className="w-4 h-4 animate-bounce" />
          <span>⚡ FLASH SALE · UP TO 70% OFF · Ends in 05:23:47</span>
          <FlameKindling className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* Category Mega Nav */}
      <div className="bg-white/5 border-b border-white/10 py-3 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 min-w-max md:min-w-0 flex-nowrap">
          {categories.map((cat) => (
            <button key={cat} className="text-[11px] font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Hero Grid — Nykaa-style split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Big Feature */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden relative aspect-[16/9] lg:aspect-auto lg:h-80">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&auto=format&fit=crop&q=80"
            alt="Main Sale Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E11D48]/80 via-[#E11D48]/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 text-white space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 w-fit px-2 py-0.5 rounded">Beauty Bonanza</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold leading-tight">Shop 5000+<br />Beauty Brands</h1>
            <a href="#catalog" className="gradient-btn px-5 py-2.5 text-xs font-bold uppercase w-fit flex items-center space-x-2 rounded-xl">
              <span>Shop Now</span><ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 2x2 Sub Grid */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {[
            { img: 'photo-1571781926291-c477ebfd024b', label: 'Skincare', sub: 'Min 30% OFF', color: '#7C3AED' },
            { img: 'photo-1515377905703-c4788e51af15', label: 'Haircare', sub: 'Up to 50% OFF', color: '#059669' },
            { img: 'photo-1469334031218-e382a71b716b', label: 'Fashion', sub: '70% OFF Clearance', color: '#0369A1' },
            { img: 'photo-1607345366928-199ea26cfe3e', label: 'Wellness', sub: 'Free Shipping', color: '#D97706' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden relative aspect-square cursor-pointer group">
              <img src={`https://images.unsplash.com/${item.img}?w=400&auto=format&fit=crop&q=80`}
                alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <div className="font-bold text-white text-sm">{item.label}</div>
                <div className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white w-fit" style={{ background: item.color }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ARCHETYPE-SPECIFIC TRUST / PROOF SECTIONS
// ──────────────────────────────────────────────────────────────────────────────
function ArchetypeTrustSection({ archetype }: { archetype: string }) {
  if (archetype === 'ORGANIC_GHARSOAPS') {
    return (
      <section className="py-16 bg-amber-950/10 border-y border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">The Artisan Standard</span>
          <h3 className="font-heading text-3xl font-bold text-white mt-2 mb-10">Why Ghar Soaps?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: '🌿', title: 'No Preservatives', sub: 'Pure botanical base, nothing else' },
              { emoji: '🏺', title: 'Copper-Vessel Crafted', sub: 'Ancient mineral enrichment process' },
              { emoji: '📦', title: 'Plastic-Free Packaging', sub: '100% Kraft paper & jute wrapping' },
              { emoji: '🌾', title: '6-Week Cold Cure', sub: 'Saponification at its purest' },
            ].map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-amber-700/20 space-y-2 text-center">
                <div className="text-4xl">{item.emoji}</div>
                <div className="font-bold text-white text-sm">{item.title}</div>
                <div className="text-xs text-gray-400">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (archetype === 'JEWELLERY_KALYAN') {
    return (
      <section className="py-16 border-y border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Certified Purity Promise</span>
            <h3 className="font-heading text-3xl font-bold text-white mt-2">The Hallmark of Trust</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { stat: '916 BIS', label: 'Hallmarked Gold Standard', sub: 'Government Bureau of Indian Standards — highest 22K purity.' },
              { stat: 'IGI/GIA', label: 'Certified Natural Diamonds', sub: 'Every diamond graded by International Gemological Institute.' },
              { stat: '115 Yr', label: 'Karigars Heritage', sub: 'Families of artisan karigars crafting since the Bengal Royal era.' },
            ].map((item, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl border border-amber-700/30 text-center space-y-3">
                <div className="font-heading text-5xl font-black bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">{item.stat}</div>
                <h4 className="font-bold text-white">{item.label}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (archetype === 'FASHION_PREMIUM') {
    return (
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A880]">Fabric Philosophy</span>
              <h3 className="font-heading text-4xl font-bold text-white leading-tight">
                Woven with Purpose.<br />Worn with Pride.
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Every thread of our Banarasi silk is handloomed by weavers in Varanasi's centuries-old weaving clusters, certified by GI (Geographical Indication) tags. Your purchase directly supports 2,400 artisan families.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {['GI-Certified Weaves', 'Pure Ahimsa Silk', 'Azo-Free Dyes', 'GOTS Organic Cotton'].map((label) => (
                  <div key={label} className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['photo-1558769132-cb1aea458c5e', 'photo-1585487000160-6ebcfceb0d03', 'photo-1506629082955-511b1aa562c8', 'photo-1509631179647-0177331693ae'].map((p, i) => (
                <div key={i} className={`aspect-square rounded-2xl overflow-hidden ${i === 1 ? 'mt-6' : ''}`}>
                  <img src={`https://images.unsplash.com/${p}?w=400&auto=format&fit=crop&q=80`} alt="Fashion lookbook" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (archetype === 'MULTISTORE_NYKAA') {
    return (
      <section className="py-10 bg-white/[0.03] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Top Brands on our Platform</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-70 font-heading text-lg sm:text-xl font-bold tracking-wider text-gray-300">
            {['LAKME', 'MAMAEARTH', 'MINIMALIST', 'PLUM', 'DOT & KEY', 'WOW SKIN', 'PILGRIM', 'FOXTALE'].map((brand) => (
              <span key={brand} className="hover:text-white transition-colors cursor-pointer">{brand}</span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default: Beauty trust section
  return (
    <section className="py-16 bg-white/[0.02] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">The Science of Clean Efficacy</span>
          <h3 className="font-heading text-3xl font-bold text-white">Proven By Clinical Trials</h3>
          <p className="text-xs text-gray-400">Results measured across 800+ participants over a rigorous 28-day blind dermatological study.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { pct: '96%', label: 'Smoother Glass-Skin Texture', desc: 'Reduction in roughness and barrier moisture loss within 14 days.', grad: 'from-purple-400 to-pink-400' },
            { pct: '92%', label: 'Visible Dark Spot Reduction', desc: 'Noticeable fading of hyperpigmentation and acne blemishes.', grad: 'from-amber-400 to-orange-400' },
            { pct: '99%', label: 'Zero White Cast', desc: 'Breathable, non-comedogenic feel in hot and humid Indian summers.', grad: 'from-emerald-400 to-teal-400' },
          ].map((item, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl border border-white/10 space-y-3">
              <span className={`font-heading text-5xl font-black text-transparent bg-gradient-to-r ${item.grad} bg-clip-text`}>{item.pct}</span>
              <h4 className="font-bold text-white text-base">{item.label}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// REVIEWS SECTION (adapts to archetype)
// ──────────────────────────────────────────────────────────────────────────────
function ReviewsSection({ archetype }: { archetype: string }) {
  const reviewsByArchetype: Record<string, { title: string; body: string; name: string; location: string; product: string }[]> = {
    BEAUTY_FOXTALE: [
      { title: '"The only Vitamin C that did not break me out!"', body: 'I have sensitive combination skin. Aura\'s formula is so soothing, my post-acne pigmentation vanished within 3 weeks. Repurchasing bottle #3!', name: 'Ananya Rao', location: 'Bandra, Mumbai', product: 'Radiance 15% Serum' },
      { title: '"Doctor recommended. My barrier was saved."', body: 'After over-exfoliating, the Hydra-Barrier Peptide Cream completely healed my burning barrier in 48 hours. Absolute godsend.', name: 'Dr. Shalini K.', location: 'Koramangala, Bengaluru', product: 'Hydra-Barrier Cream' },
      { title: '"Zero white cast under Delhi heat!"', body: 'Finding a sunscreen that doesn\'t feel like grease under makeup was impossible until this. The Velvet Petal gel leaves literally nothing on skin.', name: 'Meera Malhotra', location: 'South Delhi', product: 'Velvet Petal SPF 50+' },
    ],
    ORGANIC_GHARSOAPS: [
      { title: '"My skin has never felt this nourished!"', body: 'Switched from commercial soaps to Ghar Soaps 3 months ago. The sandalwood bar literally transformed my dry skin. Pure magic in a bar!', name: 'Priya Nair', location: 'Kochi, Kerala', product: 'Chandan Sandalwood Bar' },
      { title: '"No more chemical smell, just pure bliss!"', body: 'The kesar saffron bar smells exactly like what it claims — no synthetic fragrance. Suds up beautifully and rinses clean every time.', name: 'Ritu Sharma', location: 'Jaipur, Rajasthan', product: 'Kesar Kali Saffron Bar' },
      { title: '"My grandmother\'s recipe, finally bottled!"', body: 'This reminds me of neem paste my dadi used to make. Simple, pure, and incredibly effective for my acne-prone skin. Love the kraft packaging too!', name: 'Sunita Yadav', location: 'Lucknow, UP', product: 'Neem Tulsi Purifying Bar' },
    ],
    FASHION_PREMIUM: [
      { title: '"The silk drape is absolutely divine!"', body: 'Ordered the Banarasi silk saree for my daughter\'s wedding. The craftsmanship, zari work and luster are beyond anything available in stores today.', name: 'Geeta Agarwal', location: 'Kolkata, WB', product: 'Banarasi Katan Silk Saree' },
      { title: '"Pure linen, beautifully structured!"', body: 'The block-printed kurta set is GI-certified and it shows — the dye hasn\'t faded after 20 washes. Worth every rupee for this quality.', name: 'Aparna Krishnan', location: 'Chennai, TN', product: 'Jaipur Block Print Kurta Set' },
      { title: '"I\'ve never worn Indian fashion this luxurious!"', body: 'Finally a brand that combines heritage weaving with modern tailoring. The fit is impeccable, almost like bespoke!', name: 'Shruti Mehta', location: 'Ahmedabad, GJ', product: 'Chanderi Silk Co-ord Set' },
    ],
    JEWELLERY_KALYAN: [
      { title: '"The hallmark certificate gave me true confidence!"', body: 'Bought the 22K temple necklace for my wedding. BIS hallmark was exactly as shown. The karigar detailing is exquisite — got so many compliments!', name: 'Lakshmi Venkatesh', location: 'Hyderabad, TS', product: 'Temple Gold Necklace Set' },
      { title: '"IGI certified diamond ring, unmatched transparency!"', body: 'Every diamond specification was exactly as described online. The ring is breathtaking and the packaging with the purity certificate was very reassuring.', name: 'Nita Patel', location: 'Surat, GJ', product: 'Solitaire Diamond Ring' },
      { title: '"Home trial service is game-changing!"', body: 'The team brought 15 pieces to my house for the wedding selection. Such a stress-free experience. Will never shop jewellery any other way!', name: 'Bharathi Rajan', location: 'Coimbatore, TN', product: 'Bridal Gold Set' },
    ],
    MULTISTORE_NYKAA: [
      { title: '"Everything in one place — incredible value!"', body: 'Got beauty, wellness, and kids\' products in a single order with same-day delivery in Mumbai. The Nykaa-style experience but so much more personalised!', name: 'Divya Arora', location: 'Andheri, Mumbai', product: 'Beauty Mega Combo' },
      { title: '"Flash sales are actually legit discounts!"', body: 'Snagged 3 premium serums at 60% off during the flash sale. Products are 100% authentic — checked each batch code on the brand website.', name: 'Roopal Mehta', location: 'Powai, Mumbai', product: 'Skincare Flash Bundle' },
      { title: '"5000+ brands and the search actually works!"', body: 'Finding niche Ayurvedic brands was impossible elsewhere. Here I found exactly what I needed, with original packing and fast return if needed.', name: 'Chandana Iyer', location: 'Koramangala, Bengaluru', product: 'Ayurvedic Wellness Kit' },
    ],
  };

  const reviews = reviewsByArchetype[archetype] || reviewsByArchetype['BEAUTY_FOXTALE'];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-color)]">Real Experiences</span>
          <h3 className="font-heading text-3xl font-bold text-white mt-1">Loved by Our Customers</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-2 md:mt-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>4,850+ Verified 5-Star Reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <h4 className="font-bold text-white text-sm">{r.title}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">"{r.body}"</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{r.name}</p>
                <span className="text-[10px] text-gray-400">{r.location} · Verified Buyer</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">{r.product}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CATALOG SECTION HEADER (adapted per archetype)
// ──────────────────────────────────────────────────────────────────────────────
function getCatalogMeta(archetype: string) {
  const meta: Record<string, { label: string; title: string; categories: { id: string; label: string }[] }> = {
    BEAUTY_FOXTALE: {
      label: 'Curated Formulations',
      title: 'Bestsellers & Targeted Rituals',
      categories: [{ id: 'all', label: 'All Rituals' }, { id: 'serums', label: '✨ Active Serums' }, { id: 'moisturizers', label: '💧 Barrier Creams' }, { id: 'sunscreens', label: '☀️ UV Sun Care' }, { id: 'hair', label: '🌿 Hair & Scalp' }],
    },
    ORGANIC_GHARSOAPS: {
      label: 'Artisan Botanical Collection',
      title: 'Pure Handcrafted Soaps & Oils',
      categories: [{ id: 'all', label: 'All Products' }, { id: 'soaps', label: '🧼 Cold-Process Soaps' }, { id: 'oils', label: '🌿 Infused Body Oils' }, { id: 'packs', label: '🌾 Face Packs' }, { id: 'hair', label: '💆 Hair Rituals' }],
    },
    FASHION_PREMIUM: {
      label: 'SS 2026 Collection',
      title: 'New Season Lookbook',
      categories: [{ id: 'all', label: 'All Pieces' }, { id: 'sarees', label: '🥻 Silk Sarees' }, { id: 'kurtas', label: '👘 Kurta Sets' }, { id: 'lehengas', label: '✨ Lehengas' }, { id: 'western', label: '👗 Western' }],
    },
    JEWELLERY_KALYAN: {
      label: 'Fine Jewellery Collections',
      title: 'Gold, Diamond & Gemstone Pieces',
      categories: [{ id: 'all', label: 'All Jewellery' }, { id: 'gold', label: '⚜️ Pure Gold' }, { id: 'diamond', label: '💎 Diamond' }, { id: 'silver', label: '🪙 Silver' }, { id: 'bridal', label: '👰 Bridal Sets' }],
    },
    MULTISTORE_NYKAA: {
      label: 'Trending Products',
      title: "Today's Best Sellers",
      categories: [{ id: 'all', label: 'All Categories' }, { id: 'beauty', label: '💄 Beauty' }, { id: 'wellness', label: '💊 Wellness' }, { id: 'fashion', label: '👗 Fashion' }, { id: 'home', label: '🏠 Home' }],
    },
  };
  return meta[archetype] || meta['BEAUTY_FOXTALE'];
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export default function StorefrontHomePage() {
  const [currentTenantSlug, setCurrentTenantSlug] = useState('aura-beauty');
  const [theme, setTheme] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    async function loadStoreData() {
      setLoading(true);
      try {
        const themeData = await getTenantTheme(currentTenantSlug);
        setTheme(themeData);
        const catalogData = await getTenantProducts(currentTenantSlug);
        setProducts(catalogData);
        trackAnalyticsEvent(currentTenantSlug, 'PRODUCT_VIEW', { page: 'homepage' }).catch(() => {});
      } catch (err) {
        console.error('Failed to load store data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStoreData();
  }, [currentTenantSlug]);

  const handleAddToCart = (product: any, variantId?: string) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product.id && i.variantId === variantId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, {
        productId: product.id,
        variantId: variantId || (product.variants && product.variants[0] ? product.variants[0].id : undefined),
        title: product.title,
        variantTitle: product.variants && product.variants[0] ? product.variants[0].title : null,
        price: product.price,
        imageUrl: product.media && product.media[0] ? product.media[0].url : null,
        quantity: 1,
      }];
    });
    trackAnalyticsEvent(currentTenantSlug, 'ADD_TO_CART', { productId: product.id }).catch(() => {});
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, variantId: string | undefined, qty: number) => {
    if (qty <= 0) { handleRemoveItem(productId, variantId); return; }
    setCartItems((prev) => prev.map((i) => i.productId === productId && i.variantId === variantId ? { ...i, quantity: qty } : i));
  };

  const handleRemoveItem = (productId: string, variantId: string | undefined) => {
    setCartItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  };

  const totalCartItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const archetype = detectArchetype(theme);
  const catalogMeta = getCatalogMeta(archetype);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    const slug = p.slug || '';
    const cat = p.category?.slug || '';
    if (selectedCategory === 'serums') return cat === 'serums' || slug.includes('serum') || slug.includes('elixir');
    if (selectedCategory === 'moisturizers') return cat === 'moisturizers' || slug.includes('cream') || slug.includes('ubtan');
    if (selectedCategory === 'sunscreens') return cat === 'sunscreens' || slug.includes('sunscreen');
    if (selectedCategory === 'hair' || selectedCategory === 'hair') return cat === 'hair-care' || slug.includes('oil') || slug.includes('hair');
    if (selectedCategory === 'soaps') return slug.includes('soap') || slug.includes('bar') || slug.includes('chandan');
    if (selectedCategory === 'sarees') return slug.includes('saree') || slug.includes('silk');
    if (selectedCategory === 'gold') return slug.includes('gold') || cat === 'gold';
    if (selectedCategory === 'diamond') return slug.includes('diamond') || cat === 'diamond';
    if (selectedCategory === 'beauty') return cat.includes('beauty') || cat.includes('skincare') || cat.includes('serum');
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[var(--background-color)]">
      <Header
        theme={theme}
        cartCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentTenantSlug={currentTenantSlug}
        onSwitchTenant={(slug) => setCurrentTenantSlug(slug)}
      />

      {/* ARCHETYPE-SPECIFIC HERO */}
      {archetype === 'ORGANIC_GHARSOAPS' && <OrganicHero theme={theme} />}
      {archetype === 'FASHION_PREMIUM' && <FashionHero theme={theme} />}
      {archetype === 'JEWELLERY_KALYAN' && <JewelleryHero theme={theme} />}
      {archetype === 'MULTISTORE_NYKAA' && <MarketplaceHero theme={theme} />}
      {(archetype === 'BEAUTY_FOXTALE' || !['ORGANIC_GHARSOAPS', 'FASHION_PREMIUM', 'JEWELLERY_KALYAN', 'MULTISTORE_NYKAA'].includes(archetype)) && (
        <BeautyHero theme={theme} onQuiz={() => setIsQuizOpen(true)} />
      )}

      {/* PRESS / MEDIA STRIP */}
      <section className="py-7 bg-white/[0.03] border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] uppercase font-bold tracking-[0.25em] text-gray-400 mb-4">
            Recognized & Celebrated By Global Media
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 font-heading text-lg sm:text-xl font-bold tracking-wider text-gray-300">
            {['VOGUE INDIA', 'ELLE', 'COSMOPOLITAN', 'GRAZIA', 'FEMINA', 'GQ LUXE'].map((brand) => (
              <span key={brand} className="hover:text-white transition-colors">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-color)]">{catalogMeta.label}</span>
              <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-bold">{filteredProducts.length} Items</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">{catalogMeta.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {catalogMeta.categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all font-semibold ${
                  selectedCategory === cat.id
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-lg'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={`grid gap-8 ${archetype === 'MULTISTORE_NYKAA' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {[1, 2, 3].map((n) => <div key={n} className="glass-panel h-96 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-bold text-white">No products yet</p>
            <p className="text-xs">Products will appear here once the Brand Admin adds them to the catalog.</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${archetype === 'MULTISTORE_NYKAA' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* ARCHETYPE-SPECIFIC TRUST SECTION */}
      <ArchetypeTrustSection archetype={archetype} />

      {/* VERIFIED CUSTOMER REVIEWS */}
      <ReviewsSection archetype={archetype} />

      {/* INSTAGRAM UGC SOCIAL COMMUNITY WALL */}
      {archetype !== 'FASHION_PREMIUM' && (
        <section className="py-14 bg-white/[0.02] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 space-y-1">
              <div className="flex items-center justify-center space-x-1 text-pink-400 text-xs font-bold uppercase tracking-wider">
                <Instagram className="w-4 h-4" />
                <span>Community on Instagram</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">Tag us to be Featured</h3>
              <p className="text-xs text-gray-400">Over 140,000+ customers sharing their unboxing & ritual moments daily.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'photo-1598440947619-2c35fc9aa908', 'photo-1556228720-195a672e8a03',
                'photo-1620916566398-39f1143ab7be', 'photo-1522337360788-8b13dee7a37e',
              ].map((p, idx) => (
                <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden glass-panel border border-white/10">
                  <img src={`https://images.unsplash.com/${p}?w=500&auto=format&fit=crop&q=80`} alt="UGC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-xs text-white font-medium">
                    <span>@customer_story</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer theme={theme} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        currentTenantSlug={currentTenantSlug}
      />

      <LivePurchaseToast />

      {archetype === 'BEAUTY_FOXTALE' && (
        <SkinQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onAddToCart={(p) => handleAddToCart(p)}
          products={products}
        />
      )}
    </div>
  );
}
