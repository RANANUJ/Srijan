'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Sparkles, Check, Flame, Eye } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any, variantId?: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants && product.variants[0] ? product.variants[0].id : '',
  );
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId) || (product.variants && product.variants[0]) || null;
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const discountPercent = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  
  const mediaUrl = product.media && product.media[0] ? product.media[0].url : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, selectedVariant?.id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="group glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-[var(--primary-color)]/15 flex flex-col justify-between relative bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
      {/* Top Media & Badges */}
      <div className="relative aspect-square overflow-hidden bg-black/40">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={mediaUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10 pointer-events-none">
          {product.is_bestseller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-lg">
              <Sparkles className="w-3 h-3 inline" />
              <span>Bestseller</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[var(--secondary-color)] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <Link
          href={`/products/${product.slug}`}
          className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium pr-1">View</span>
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Star Rating */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span className="uppercase tracking-widest text-[10px] font-bold text-[var(--primary-color)]">
              {product.category?.name || 'Clean Skincare'}
            </span>
            <div className="flex items-center space-x-1 text-amber-400 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>4.9</span>
              <span className="text-gray-500 font-normal">({Math.floor(850 + (product.price % 300) * 4)})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-[var(--primary-color)] transition-colors">
            <h3 className="font-heading text-base font-bold text-white line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Benefits Tagline */}
          {product.benefits && (
            <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1 italic">
              ✨ {product.benefits}
            </p>
          )}

          {/* Variant Selector Pills if multi-variant */}
          {product.variants && product.variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-all ${
                    v.id === selectedVariantId
                      ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20 text-white font-bold'
                      : 'border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing, Stock Urgency & Add Button */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-white">₹{currentPrice.toLocaleString('en-IN')}</span>
              {currentMrp > currentPrice && (
                <span className="text-xs text-gray-400 line-through">₹{currentMrp.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-medium">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span>Only {selectedVariant?.inventory_count || 12} left</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 rounded-xl transition-all shadow-md active:scale-98 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'gradient-btn text-white hover:shadow-lg'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
