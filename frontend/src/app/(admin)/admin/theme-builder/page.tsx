'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTenantTheme, updateTenantTheme } from '@/lib/api';
import { Palette, Sparkles, Check, RefreshCw } from 'lucide-react';

export default function ThemeBuilderPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState('#EC4899');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [backgroundColor, setBackgroundColor] = useState('#0F172A');
  const [headingFont, setHeadingFont] = useState('Playfair Display');
  const [bodyFont, setBodyFont] = useState('Plus Jakarta Sans');
  const [borderRadius, setBorderRadius] = useState('12px');
  const [cardStyle, setCardStyle] = useState('glassmorphism');

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    async function loadTheme() {
      try {
        const theme = await getTenantTheme(tenantSlug);
        setBrandName(theme.brand_name || '');
        setLogoUrl(theme.logo_url || '');
        setPrimaryColor(theme.primary_color || '#7C3AED');
        setSecondaryColor(theme.secondary_color || '#EC4899');
        setAccentColor(theme.accent_color || '#10B981');
        setBackgroundColor(theme.background_color || '#0F172A');
        setHeadingFont(theme.heading_font || 'Playfair Display');
        setBodyFont(theme.body_font || 'Plus Jakarta Sans');
        setBorderRadius(theme.border_radius || '12px');
        setCardStyle(theme.card_style || 'glassmorphism');
      } catch (err) {
        console.error('Failed to load theme:', err);
      }
    }
    loadTheme();
  }, [tenantSlug]);

  const handleSaveTheme = async () => {
    setSaving(true);
    setSavedMessage('');
    const token = localStorage.getItem('srijan_token') || '';

    try {
      await updateTenantTheme(tenantSlug, token, {
        brand_name: brandName,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        background_color: backgroundColor,
        heading_font: headingFont,
        body_font: bodyFont,
        border_radius: borderRadius,
        card_style: cardStyle,
      });
      setSavedMessage('✨ Theme configuration published! All visitors will see your changes instantly.');
    } catch (err: any) {
      alert(err.message || 'Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
              <Palette className="w-6 h-6 text-pink-400" />
              <span>Store Visual Styling Engine</span>
            </h1>
            <p className="text-xs text-gray-400">Customize brand identity, CSS variables, and layout per tenant</p>
          </div>
          <button
            onClick={handleSaveTheme}
            disabled={saving}
            className="gradient-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-xl flex items-center space-x-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{saving ? 'Publishing...' : 'Save & Publish Theme'}</span>
          </button>
        </div>

        {savedMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-xl text-xs text-emerald-400 font-semibold">
            {savedMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-heading text-base font-bold text-white">1. Brand Identity</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-heading text-base font-bold text-white">2. Color Palette (CSS Variables)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-8 w-12 bg-transparent cursor-pointer" />
                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white uppercase w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-8 w-12 bg-transparent cursor-pointer" />
                    <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white uppercase w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Accent Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-8 w-12 bg-transparent cursor-pointer" />
                    <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white uppercase w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-8 w-12 bg-transparent cursor-pointer" />
                    <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white uppercase w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-heading text-base font-bold text-white">3. Typography & Styling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Heading Font</label>
                  <select value={headingFont} onChange={(e) => setHeadingFont(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white">
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="Cinzel">Cinzel (Ayurvedic/Royal)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Inter">Inter (Clean)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Border Radius</label>
                  <select value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white">
                    <option value="0px">0px (Sharp Modern)</option>
                    <option value="8px">8px (Standard Rounded)</option>
                    <option value="16px">16px (Extra Rounded)</option>
                    <option value="9999px">9999px (Pill Radius)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
            <h3 className="font-heading text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real-Time Component Preview</span>
            </h3>

            <div
              className="p-6 rounded-2xl border transition-all duration-300 space-y-4"
              style={{
                backgroundColor: backgroundColor,
                borderRadius: borderRadius,
                borderColor: primaryColor,
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                  {brandName ? brandName.charAt(0) : 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg" style={{ fontFamily: headingFont }}>{brandName || 'Sample Brand'}</h4>
                  <span className="text-[10px] text-emerald-400">Dynamic Theme Active</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: primaryColor }}>Bestseller Serum</span>
                <h5 className="font-bold text-white text-sm">Glow Radiance Vitamin C</h5>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-extrabold text-white text-base">₹1,199</span>
                  <button
                    className="px-4 py-2 text-xs font-bold text-white rounded shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      borderRadius: borderRadius,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">Changes updated dynamically via CSS variables without code redeployment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
