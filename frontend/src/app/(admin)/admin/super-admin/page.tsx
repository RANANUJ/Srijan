'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFromApi, updateTenantBrand } from '@/lib/api';
import {
  Building2, TrendingUp, Users, Package, Plus, Eye, Settings,
  CheckCircle2, AlertCircle, Clock, Zap, DollarSign, BarChart3,
  Globe, MessageCircle, ShieldCheck, ChevronRight, X, Sparkles,
  RefreshCw, ExternalLink, Palette, Crown, Gem, Shirt, ShoppingBag,
  Layers, Search
} from 'lucide-react';

// ─── Archetype Definitions ──────────────────────────────────────────────────
const ARCHETYPES = [
  {
    id: 'BEAUTY_FOXTALE',
    name: 'Clean Skincare & Dermocosmetics',
    inspiredBy: 'Pilgrim / Foxtale / Dot & Key',
    icon: Sparkles,
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    description: 'Pastel modern luxury, clinical efficacy trials, dermat approved badges, 30-sec skin routine quiz, active ingredient spotlights.',
    previewColors: ['#7C3AED', '#EC4899', '#0B0F19'],
  },
  {
    id: 'ORGANIC_GHARSOAPS',
    name: 'Handcrafted Soaps & Ayurveda',
    inspiredBy: 'Ghar Soaps / Khadi Naturals',
    icon: Layers,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Warm sandalwood gold & herbal green tones, cold-process artisan soap badges, raw ingredients breakdown, before/after magic transformation.',
    previewColors: ['#D97706', '#059669', '#0F141C'],
  },
  {
    id: 'FASHION_PREMIUM',
    name: 'Luxury Apparel & Haute Couture',
    inspiredBy: 'Zara / FabIndia / House of Masaba',
    icon: Shirt,
    badgeColor: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
    description: 'Monochrome editorial minimalism, bold typography, lookbook visual carousels, textile purity guarantees, model sizing guides.',
    previewColors: ['#FFFFFF', '#C5A880', '#05070B'],
  },
  {
    id: 'JEWELLERY_KALYAN',
    name: 'Fine Jewellery & Hallmarked Gold',
    inspiredBy: 'Kalyan Jewellers / CaratLane / Tanishq',
    icon: Gem,
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    description: 'Opulent 24K gold & imperial emerald on deep velvet noir, BIS Hallmark 916 certified tags, diamond purity, insured doorstep delivery.',
    previewColors: ['#F59E0B', '#047857', '#080B11'],
  },
  {
    id: 'MULTISTORE_NYKAA',
    name: 'Multi-Brand Mega Marketplace',
    inspiredBy: 'Nykaa / Flipkart D2C',
    icon: ShoppingBag,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    description: 'High-density multi-category mega navigation, flash sale countdown tickers, deal of the day banners, multi-brand catalog showcase.',
    previewColors: ['#E11D48', '#2563EB', '#090D16'],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: string;
  status: string;
  owner_email: string;
  owner_phone: string;
  created_at: string;
  domains?: Array<{ id: string; domain: string; is_primary: boolean; ssl_status: string }>;
  theme?: {
    brand_name: string;
    primary_color: string;
    secondary_color: string;
    logo_url?: string;
    card_style?: string;
    heading_font?: string;
  };
  _count?: { products: number; orders: number; users: number };
}

const PLAN_COLORS: Record<string, string> = {
  STARTER: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  PRO: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  BUSINESS: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-emerald-400 bg-emerald-500/10',
  TRIAL: 'text-amber-400 bg-amber-500/10',
  SUSPENDED: 'text-red-400 bg-red-500/10',
};

// ─── Provision New Brand Modal ───────────────────────────────────────────────
function NewBrandModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    plan: 'PRO',
    archetype: 'BEAUTY_FOXTALE',
    customDomain: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: 'BrandAdmin123!',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetchFromApi('/admin/tenants', {
        method: 'POST',
        body: JSON.stringify(form),
        tenantSlug: 'platform',
        token: localStorage.getItem('srijan_operator_token') || '',
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create brand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-7 space-y-6 relative my-8 bg-[#0D1322] border border-white/20 shadow-2xl rounded-3xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-heading text-xl font-bold text-white">Provision New Independent Brand</h2>
          </div>
          <p className="text-xs text-gray-400">
            Select a tailored D2C website archetype (e.g. Foxtale, Ghar Soaps, Kalyan Jewellers) and assign custom domain.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ARCHETYPE SELECTION */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              1. Choose Website Archetype & Layout Style *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {ARCHETYPES.map((arch) => {
                const Icon = arch.icon;
                const isSelected = form.archetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => set('archetype', arch.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 ring-1 ring-violet-500 shadow-md'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-violet-400" />
                        <span className="font-bold text-xs text-white">{arch.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        {arch.previewColors.map((c, i) => (
                          <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-violet-300 font-semibold block">{arch.inspiredBy}</span>
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">{arch.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BASIC BRAND INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Name *</label>
              <input
                required
                value={form.name}
                onChange={e => { set('name', e.target.value); set('slug', autoSlug(e.target.value)); }}
                placeholder="e.g. Foxtale Skincare"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Internal Slug *</label>
              <input
                required
                value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="foxtale-skincare"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* DOMAIN & PLAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Custom Brand Domain (Optional)</label>
              <input
                value={form.customDomain}
                onChange={e => set('customDomain', e.target.value)}
                placeholder="e.g. www.foxtalebeauty.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Can be attached or edited later anytime.</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Subscription Plan</label>
              <select
                value={form.plan}
                onChange={e => set('plan', e.target.value)}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="STARTER">Starter — ₹999/mo (Up to 25 Products)</option>
                <option value="PRO">Pro — ₹2,499/mo (Unlimited + WhatsApp)</option>
                <option value="BUSINESS">Business — ₹4,999/mo (Custom Domain + Shiprocket)</option>
              </select>
            </div>
          </div>

          {/* OWNER CREDENTIALS */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <span className="text-xs font-bold text-white block">Owner Login Credentials (Handover to Client)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Owner Name</label>
                <input
                  required
                  value={form.ownerName}
                  onChange={e => set('ownerName', e.target.value)}
                  placeholder="e.g. Romita Mazumdar"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={form.ownerEmail}
                  onChange={e => set('ownerEmail', e.target.value)}
                  placeholder="founder@brand.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                <input
                  required
                  value={form.ownerPassword}
                  onChange={e => set('ownerPassword', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loading ? 'Deploying Store...' : 'Deploy Brand Store'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Archetype & Custom Domain Modal ────────────────────────────────────
function EditBrandModal({
  tenant,
  onClose,
  onUpdated,
}: {
  tenant: Tenant;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [selectedArchetype, setSelectedArchetype] = useState(
    tenant.theme?.card_style === 'artisanal_organic'
      ? 'ORGANIC_GHARSOAPS'
      : tenant.theme?.card_style === 'minimalist_fashion'
      ? 'FASHION_PREMIUM'
      : tenant.theme?.card_style === 'gold_hallmark'
      ? 'JEWELLERY_KALYAN'
      : tenant.theme?.card_style === 'marketplace_grid'
      ? 'MULTISTORE_NYKAA'
      : 'BEAUTY_FOXTALE',
  );
  const [brandName, setBrandName] = useState(tenant.theme?.brand_name || tenant.name);
  const [customDomain, setCustomDomain] = useState(
    tenant.domains?.find(d => !d.domain.includes('srijanplatform.com'))?.domain || '',
  );
  const [plan, setPlan] = useState(tenant.plan);
  const [status, setStatus] = useState(tenant.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('srijan_operator_token') || '';
    try {
      await updateTenantBrand(token, tenant.id, {
        name: brandName,
        plan,
        status,
        archetype: selectedArchetype,
        customDomain: customDomain || undefined,
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update brand template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-7 space-y-6 relative my-8 bg-[#0D1322] border border-white/20 shadow-2xl rounded-3xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-400" />
            <span>Customize Website Archetype & Custom Domain</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Brand: <span className="font-bold text-white">{tenant.name}</span> ({tenant.slug})
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* ARCHETYPE SELECTOR */}
          <div>
            <label className="text-gray-300 font-bold uppercase tracking-wider block mb-2">
              Select Website Design & Industry Archetype
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {ARCHETYPES.map((arch) => {
                const Icon = arch.icon;
                const isSelected = selectedArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 ring-1 ring-violet-500 text-white'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-violet-400 shrink-0" />
                      <div>
                        <p className="font-bold text-xs">{arch.name}</p>
                        <span className="text-[10px] text-gray-400 block">{arch.inspiredBy}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {arch.previewColors.map((c, i) => (
                        <span key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM DOMAIN */}
          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Assigned Custom Domain (White-Label)
            </label>
            <div className="relative">
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="e.g. www.foxtalebeauty.com or shop.gharsoaps.shop"
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-white font-mono"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" /> Auto-SSL
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Point client's DNS CNAME to your platform IP or edge proxy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Plan</label>
              <select
                value={plan}
                onChange={e => setPlan(e.target.value)}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-2 text-white"
              >
                <option value="STARTER">STARTER</option>
                <option value="PRO">PRO</option>
                <option value="BUSINESS">BUSINESS</option>
              </select>
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Store Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-2 text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIAL">TRIAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/15 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-xs"
            >
              {loading ? 'Applying Template...' : 'Save Template & Domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Super Admin Page ───────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);
    try {
      const data = await fetchFromApi('/admin/tenants', {
        tenantSlug: 'platform',
        token: localStorage.getItem('srijan_operator_token') || '',
      });
      setTenants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tenants.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.owner_email && t.owner_email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const platformStats = {
    totalBrands: tenants.length,
    activeBrands: tenants.filter(t => t.status === 'ACTIVE').length,
    mrr: tenants.reduce((acc, t) => {
      const price = t.plan === 'BUSINESS' ? 4999 : t.plan === 'PRO' ? 2499 : 999;
      return t.status === 'ACTIVE' ? acc + price : acc;
    }, 0),
    totalOrders: tenants.reduce((acc, t) => acc + (t._count?.orders || 0), 0),
    totalProducts: tenants.reduce((acc, t) => acc + (t._count?.products || 0), 0),
  };

  const getArchetypeTag = (tenant: Tenant) => {
    const cardStyle = tenant.theme?.card_style;
    if (cardStyle === 'artisanal_organic') return { label: 'Organic Ghar Soaps', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (cardStyle === 'minimalist_fashion') return { label: 'Luxury Fashion', color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' };
    if (cardStyle === 'gold_hallmark') return { label: 'Kalyan Jewellers', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    if (cardStyle === 'marketplace_grid') return { label: 'Nykaa Marketplace', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    return { label: 'Foxtale Skincare', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' };
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
                Srijan Operator Master Console
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <span>White-Label Brand & Archetype Engine</span>
            </h1>
            <p className="text-xs text-gray-400">
              Provision, assign website archetypes (Pilgrim, Ghar Soaps, Kalyan Jewellers, Nykaa), and manage custom domains.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNewBrand(true)}
              className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Brand</span>
            </button>
          </div>
        </div>

        {/* Platform KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Total Brands</span>
              <Building2 className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-black text-white">{platformStats.totalBrands}</div>
            <span className="text-[10px] text-emerald-400">{platformStats.activeBrands} Active stores</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Monthly Recurring MRR</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">₹{platformStats.mrr.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-gray-400">SaaS subscription revenue</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Platform Orders</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{platformStats.totalOrders}</div>
            <span className="text-[10px] text-gray-400">Processed through checkout</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span>Total Catalog SKUs</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{platformStats.totalProducts}</div>
            <span className="text-[10px] text-gray-400">Products across all brands</span>
          </div>
        </div>

        {/* 5 Archetype Showcase Strip */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-violet-400" />
              <span>Available Website Archetypes In Engine</span>
            </span>
            <span className="text-[10px] text-gray-500">Only Super Admin can change designs</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {ARCHETYPES.map((arch) => (
              <div key={arch.id} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${arch.badgeColor}`}>
                  {arch.name}
                </span>
                <p className="text-[10px] text-gray-400 font-semibold">{arch.inspiredBy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Tenants Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-white/5 rounded-xl p-1">
              {(['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === f ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {f} {f !== 'ALL' && `(${tenants.filter(t => t.status === f).length})`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search brand, domain, owner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="glass-panel p-12 text-center text-gray-500 text-sm">Loading brands...</div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel p-12 text-center space-y-3">
              <Building2 className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-gray-400 text-sm">No matching brand tenants found.</p>
            </div>
          ) : (
            <div className="glass-panel overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="p-4">Brand / Domain</th>
                    <th className="p-4">Assigned Archetype</th>
                    <th className="p-4">Plan & Status</th>
                    <th className="p-4 text-center">Catalog SKUs</th>
                    <th className="p-4 text-center">Orders</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(tenant => {
                    const archTag = getArchetypeTag(tenant);
                    const primaryCustomDomain = tenant.domains?.find(d => !d.domain.includes('srijanplatform.com'))?.domain;

                    return (
                      <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                        {/* Brand & Domain */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-md"
                              style={{
                                background: `linear-gradient(135deg, ${tenant.theme?.primary_color || '#7C3AED'}, ${tenant.theme?.secondary_color || '#EC4899'})`,
                              }}
                            >
                              {(tenant.theme?.brand_name || tenant.name).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{tenant.theme?.brand_name || tenant.name}</div>
                              {primaryCustomDomain ? (
                                <div className="text-[11px] text-cyan-400 font-mono font-semibold flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{primaryCustomDomain}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-gray-400 font-mono">{tenant.slug}.srijanplatform.com</div>
                              )}
                              <span className="text-[10px] text-gray-500">{tenant.owner_email || 'No owner email'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Archetype */}
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${archTag.color}`}>
                            {archTag.label}
                          </span>
                        </td>

                        {/* Plan & Status */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block w-fit ${PLAN_COLORS[tenant.plan] || PLAN_COLORS.PRO}`}>
                              {tenant.plan}
                            </span>
                            <span className={`text-[10px] font-semibold block ${STATUS_COLORS[tenant.status] || STATUS_COLORS.ACTIVE}`}>
                              ● {tenant.status}
                            </span>
                          </div>
                        </td>

                        {/* SKUs */}
                        <td className="p-4 text-center font-bold text-white">
                          {tenant._count?.products ?? 0}
                        </td>

                        {/* Orders */}
                        <td className="p-4 text-center font-bold text-emerald-400">
                          {tenant._count?.orders ?? 0}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setEditingTenant(tenant)}
                              className="p-2 rounded-xl bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 border border-violet-500/30 transition-colors"
                              title="Customize Website Archetype & Domain"
                            >
                              <Palette className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/admin/dashboard?tenant=${tenant.slug}`}
                              className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
                              title="Open Brand Admin"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <a
                              href={`/?tenant=${tenant.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="View Storefront"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: New Brand */}
        {showNewBrand && (
          <NewBrandModal onClose={() => setShowNewBrand(false)} onCreated={loadTenants} />
        )}

        {/* Modal: Edit Archetype & Domain */}
        {editingTenant && (
          <EditBrandModal tenant={editingTenant} onClose={() => setEditingTenant(null)} onUpdated={loadTenants} />
        )}
      </div>
    </div>
  );
}
