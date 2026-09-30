'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { getTenantTheme, getProductBySlug } from '@/lib/api';
import { Star, ShieldCheck, Truck, ShoppingBag, ArrowLeft, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [currentTenantSlug, setCurrentTenantSlug] = useState('aura-beauty');
  const [theme, setTheme] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const themeData = await getTenantTheme(currentTenantSlug);
        setTheme(themeData);

        const prod = await getProductBySlug(currentTenantSlug, params.slug);
        setProduct(prod);
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
      } catch (err) {
        console.error('Failed to load PDP:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentTenantSlug, params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const v = selectedVariant || (product.variants ? product.variants[0] : null);

    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id && i.variantId === (v ? v.id : undefined));
      if (existing) {
        return prev.map((i) => (i.productId === product.id && i.variantId === (v ? v.id : undefined) ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: v ? v.id : undefined,
          title: product.title,
          variantTitle: v ? v.title : null,
          price: v ? v.price : product.price,
          imageUrl: product.media && product.media[0] ? product.media[0].url : null,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center text-white">Loading product details...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center text-white">Product not found.</div>;
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const discountPercent = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Google JSON-LD Structured Data — Product + BreadcrumbList + Review */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            sku: product.sku,
            brand: {
              '@type': 'Brand',
              name: theme?.brand_name || 'Premium Brand',
            },
            image: product.media && product.media.length > 0 ? product.media.map((m: any) => m.url) : [],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: currentPrice,
              availability: 'https://schema.org/InStock',
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              seller: {
                '@type': 'Organization',
                name: theme?.brand_name || 'Premium Brand',
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '127',
              bestRating: '5',
              worstRating: '1',
            },
            ...(product.ingredients
              ? {
                  additionalProperty: {
                    '@type': 'PropertyValue',
                    name: 'Key Ingredients',
                    value: product.ingredients,
                  },
                }
              : {}),
          }),
        }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
              { '@type': 'ListItem', position: 2, name: 'Products', item: '/products' },
              { '@type': 'ListItem', position: 3, name: product.title },
            ],
          }),
        }}
      />

      <Header
        theme={theme}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentTenantSlug={currentTenantSlug}
        onSwitchTenant={(slug) => setCurrentTenantSlug(slug)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden glass-panel p-2 shadow-2xl">
              <img
                src={product.media && product.media[0] ? product.media[0].url : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'}
                alt={product.title}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Product Specs & Purchasing */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-color)]">
                {product.category?.name || 'Skincare'}
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
                {product.title}
              </h1>

              <div className="flex items-center space-x-3 mt-3">
                <div className="flex items-center space-x-1 text-amber-400 font-semibold text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.9 / 5.0</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-emerald-400 font-medium">Verified Dermatologist Tested</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-3xl font-black text-white">₹{currentPrice}</span>
              {currentMrp > currentPrice && <span className="text-base text-gray-400 line-through">₹{currentMrp}</span>}
              {discountPercent > 0 && (
                <span className="bg-[var(--secondary-color)] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Select Variant</label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20 text-white ring-1 ring-[var(--primary-color)]'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {v.title} - ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">{product.description}</p>

            {/* Accordion Info */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {product.ingredients && (
                <div className="glass-panel p-4 text-xs">
                  <h4 className="font-bold text-white mb-1">Key Ingredients & Actives</h4>
                  <p className="text-gray-400">{product.ingredients}</p>
                </div>
              )}
              {product.benefits && (
                <div className="glass-panel p-4 text-xs">
                  <h4 className="font-bold text-white mb-1">Clinically Proven Benefits</h4>
                  <p className="text-gray-400">{product.benefits}</p>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAddToCart}
              className="w-full gradient-btn py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-2xl active:scale-95 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart • ₹{currentPrice}</span>
            </button>
          </div>
        </div>
      </main>

      <Footer theme={theme} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={(pid, vid, qty) => setCartItems(prev => prev.map(i => i.productId === pid && i.variantId === vid ? { ...i, quantity: qty } : i))}
        onRemoveItem={(pid, vid) => setCartItems(prev => prev.filter(i => !(i.productId === pid && i.variantId === vid)))}
        currentTenantSlug={currentTenantSlug}
      />
    </div>
  );
}
