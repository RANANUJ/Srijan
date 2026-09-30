'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Star, CheckCircle2, Globe, Zap, Shield,
  ShoppingBag, BarChart3, MessageCircle, Palette, Smartphone, Users,
  TrendingUp, Package, ChevronDown, Menu, X, Building2
} from 'lucide-react';

// -------------------------------------------------------
// PRICING TIERS
// -------------------------------------------------------
const PLANS = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/month',
    description: 'Perfect for new D2C brands getting their first 100 orders.',
    color: 'from-slate-500 to-slate-600',
    borderColor: 'border-white/10',
    popular: false,
    features: [
      'Shared subdomain (brand.srijan.store)',
      'Up to 50 products',
      'Razorpay & COD Checkout',
      'GST Tax Invoice generation',
      'WhatsApp Order Confirmation',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '₹2,499',
    period: '/month',
    description: 'For scaling brands that want full ownership and branding.',
    color: 'from-violet-600 to-pink-600',
    borderColor: 'border-violet-500/50',
    popular: true,
    features: [
      'Custom domain (www.yourbrand.com) + FREE SSL',
      'Unlimited products & categories',
      'Abandoned Cart WhatsApp Recovery',
      'Automated packing & dispatch alerts',
      'Coupon Engine with usage analytics',
      'Priority support & onboarding call',
    ],
  },
  {
    name: 'Business',
    price: '₹4,999',
    period: '/month',
    description: 'Enterprise-grade for high-volume brands and agencies.',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30',
    popular: false,
    features: [
      'Everything in Pro',
      'Multi-staff RBAC (Manager, Inventory, Orders roles)',
      'Advanced analytics & LTV dashboard',
      'Meta Pixel & Google Merchant feed',
      'Schema.org SEO & dynamic sitemaps',
      'Dedicated account manager',
    ],
  },
];

// -------------------------------------------------------
// FEATURES
// -------------------------------------------------------
const FEATURES = [
  { icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/10', title: 'Visual Theme Builder', desc: 'Drag-and-drop color palettes, fonts, border radius, and card styles. Your store looks 100% unique — no two brands ever look the same.' },
  { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', title: 'Custom Domain & Free SSL', desc: 'Connect www.yourbrand.com in minutes. Auto-provisioned SSL certificates keep your customers safe and Google happy.' },
  { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'WhatsApp WABA Automation', desc: 'Auto-send order confirmations, abandoned cart nudges at the 2-hour mark, packing slips, and live tracking links via WhatsApp.' },
  { icon: ShoppingBag, color: 'text-violet-400', bg: 'bg-violet-500/10', title: 'Razorpay + COD Checkout', desc: 'Accept UPI, credit/debit cards, net banking, and COD. Funds deposited directly to your brand\'s bank account.' },
  { icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Business Analytics Dashboard', desc: 'Real-time revenue, orders, customer LTV, low-stock alerts, and cart funnel conversion rates — all in your admin.' },
  { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'GST-Ready & Legally Compliant', desc: 'Automatic GST tax invoice with CGST/SGST breakdown, HSN codes, and customer GSTIN support for B2B orders.' },
];

// -------------------------------------------------------
// TESTIMONIALS / BRAND STORIES
// -------------------------------------------------------
const TESTIMONIALS = [
  { brand: 'Aura Beauty', owner: 'Priya Sharma', role: 'Founder & CEO', avatar: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=100&auto=format&fit=crop&q=80', quote: 'We went live with our Vitamin C Serum store in under 48 hours. Our customers have no idea this is SaaS — they think we spent ₹10 Lakhs on a custom build!', rating: 5, revenue: '₹4.2L', period: 'last month' },
  { brand: 'Veda Organics', owner: 'Aarav Mehta', role: 'Co-founder', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80', quote: 'WhatsApp abandoned cart automation alone recovered 28% of our dropped carts. That feature pays for the subscription 20 times over.', rating: 5, revenue: '₹2.8L', period: 'last month' },
  { brand: 'Desi Roots', owner: 'Kavya Iyer', role: 'D2C Brand Owner', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', quote: 'The GST invoice feature sorted out our CA\'s headache immediately. Everything is automated and the brand looks incredibly premium.', rating: 5, revenue: '₹1.1L', period: 'first month' },
];

// -------------------------------------------------------
// STATS
// -------------------------------------------------------
const STATS = [
  { value: '₹12 Cr+', label: 'GMV processed on platform', icon: TrendingUp },
  { value: '200+', label: 'Active D2C brand stores', icon: Building2 },
  { value: '98.4%', label: 'Uptime SLA guarantee', icon: Zap },
  { value: '4.9 / 5.0', label: 'Brand owner satisfaction', icon: Star },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [niche, setNiche] = useState('beauty');
  const [submitted, setSubmitted] = useState(false);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate self-serve signup
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white font-sans overflow-x-hidden">

      {/* ---- NAVBAR ---- */}
      <nav className="sticky top-0 z-50 bg-[#050810]/90 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/30">S</div>
            <span className="font-bold text-white text-lg tracking-tight">Srijan</span>
            <span className="hidden sm:block text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-semibold">D2C SaaS Platform</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 text-sm text-gray-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
            <a href="#onboarding" className="hover:text-white transition-colors">Get Started</a>
          </div>

          {/* CTA */}
          <div className="flex items-center space-x-3">
            <Link href="/admin/login" className="hidden sm:block text-xs text-gray-400 hover:text-white transition-colors font-medium">Brand Login</Link>
            <a href="#onboarding" className="bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5">
              Launch Your Store →
            </a>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-400">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>India's #1 White-Label D2C E-Commerce Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Launch a
            <span className="block bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Premium D2C Store
            </span>
            in 48 Hours
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            Your brand. Your domain. Your bank account. Fully white-labeled — your customers will never know it's a shared platform. Built for Indian beauty, skincare, and wellness D2C brands.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#onboarding" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-violet-500/30 hover:opacity-95 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2">
              <span>Start Free — Launch in 48 Hours</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
              <span>See Live Demo</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Social proof row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No coding required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Custom domain + Free SSL</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Razorpay settlements</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>GST compliant invoices</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- LIVE DEMO PREVIEW ---- */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel p-2 rounded-3xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-slate-800/60 rounded-2xl px-4 py-3 flex items-center space-x-2 mb-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 bg-slate-700/60 rounded-md px-4 py-1.5 text-[11px] text-gray-400 font-mono flex items-center space-x-2">
                <span className="text-emerald-400">🔒</span>
                <span>www.yourbrand.com</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {/* Aura Beauty Preview */}
              <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-purple-500/20">
                <div className="bg-gradient-to-r from-violet-700 to-pink-700 p-3 text-xs font-bold text-white text-center">
                  ✨ Aura Beauty — Luxury Skincare Store
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Bestseller</div>
                    <div className="font-bold text-white text-sm mt-0.5">15% Vitamin C Glow Serum</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">✨ Brightens & reduces hyperpigmentation</div>
                    <div className="flex items-center justify-between mt-2">
                      <div><span className="font-black text-white">₹1,199</span> <span className="text-gray-500 text-[10px] line-through">₹1,499</span></div>
                      <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">Add to Cart</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Veda Organics Preview */}
              <div className="bg-[#F0FDF4] rounded-2xl overflow-hidden border border-emerald-500/30">
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-3 text-xs font-bold text-white text-center">
                  🌿 Veda Organics — Ayurvedic Wellness Store
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-white border border-emerald-200 rounded-xl p-3">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">Bestseller</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">Bhringraj & Amla Hair Oil</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">🌿 Prevents hair fall, stops graying</div>
                    <div className="flex items-center justify-between mt-2">
                      <div><span className="font-black text-slate-800">₹699</span> <span className="text-gray-400 text-[10px] line-through">₹899</span></div>
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">Add to Cart</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 pb-4">Both stores run on the same platform — zero shared branding, zero cross-data contamination.</p>
          </div>
        </div>
      </section>

      {/* ---- STATS ---- */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="space-y-2">
                <Icon className="w-6 h-6 text-violet-400 mx-auto" />
                <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Everything Included</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Everything Your D2C Brand Needs to Win
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              No patchwork of third-party tools. One platform engineered end-to-end for high-performance Indian D2C brands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-panel p-6 space-y-3 hover:border-violet-500/30 transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-violet-300 transition-colors">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <section id="testimonials" className="py-20 px-4 bg-white/2 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Brand Success Stories</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Real Brands. Real Revenue.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.brand} className="glass-panel p-6 space-y-4 hover:border-violet-500/30 transition-all">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">"{t.quote}"</p>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={t.avatar} className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/30" alt={t.owner} />
                    <div>
                      <div className="text-xs font-bold text-white">{t.owner}</div>
                      <div className="text-[10px] text-gray-400">{t.role}, {t.brand}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">{t.revenue}</div>
                    <div className="text-[10px] text-gray-500">{t.period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- PRICING ---- */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Simple, Fair Pricing</h2>
            <p className="text-gray-400 text-sm">No transaction fees. No revenue cuts. You keep 100% of your brand's revenue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative glass-panel p-7 space-y-5 border ${plan.borderColor} transition-all hover:-translate-y-1`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white font-black text-sm`}>
                  {plan.name.charAt(0)}
                </div>

                <div>
                  <div className="font-black text-white text-xl">{plan.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{plan.description}</div>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-gray-400">{plan.period}</span>
                </div>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start space-x-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#onboarding"
                  className={`block w-full text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/30 hover:opacity-90' : 'bg-white/10 text-white hover:bg-white/15'}`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            All plans include 14-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* ---- SELF-SERVE ONBOARDING FORM ---- */}
      <section id="onboarding" className="py-20 px-4 bg-gradient-to-b from-violet-950/20 to-transparent border-t border-white/5">
        <div className="max-w-xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Get Started in 5 minutes</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Launch Your D2C Store Today</h2>
            <p className="text-gray-400 text-sm">Fill in your brand details and we'll have your store live within 48 hours — fully white-labeled with your domain and identity.</p>
          </div>

          {submitted ? (
            <div className="glass-panel p-10 text-center space-y-5 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="font-black text-white text-xl">🎉 You're on the list!</h3>
              <p className="text-sm text-gray-300">We've received your request for <b className="text-violet-300">{brandName}</b>. Our onboarding team will reach out to <b className="text-white">{email}</b> within <b>24 hours</b> to provision your store.</p>
              <div className="text-xs text-gray-500 bg-white/5 p-3 rounded-lg">Meanwhile, browse your future store demo at <a href="/" className="text-violet-400 underline">localhost:3000</a></div>
            </div>
          ) : (
            <form
              onSubmit={handleOnboardingSubmit}
              className="glass-panel p-8 space-y-4 text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Your Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="e.g. Glow Botanicals"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Business Niche *</label>
                  <select
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="beauty">Beauty & Skincare</option>
                    <option value="ayurveda">Ayurveda & Wellness</option>
                    <option value="haircare">Hair Care</option>
                    <option value="nutrition">Nutrition & Supplements</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="other">Other D2C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Business Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourbrand.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">WhatsApp Number *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-gray-400">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold py-4 rounded-xl text-sm shadow-2xl shadow-violet-500/30 hover:opacity-95 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch My D2C Store — Free for 14 Days</span>
              </button>

              <p className="text-center text-[11px] text-gray-500">
                By submitting, you agree to our Terms of Service. No credit card required.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-white/5 py-10 px-4 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center font-bold text-white text-xs">S</div>
            <span className="font-bold text-gray-400">Srijan D2C SaaS Platform</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-600">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            <a href="#" className="hover:text-gray-400">Refund Policy</a>
            <Link href="/admin/login" className="hover:text-gray-400">Brand Admin Login</Link>
          </div>
          <p>© 2026 Srijan. All rights reserved. Built in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
