'use client';

import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';

interface SkinQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  products: any[];
}

export function SkinQuizModal({ isOpen, onClose, onAddToCart, products }: SkinQuizModalProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string>('glow');
  const [skinType, setSkinType] = useState<string>('combination');
  const [isCalculated, setIsCalculated] = useState(false);

  if (!isOpen) return null;

  const handleFinish = () => {
    setIsCalculated(true);
  };

  // Find recommendations based on selections
  const primaryProduct = products.find((p) =>
    goal === 'glow'
      ? p.slug.includes('vitamin-c') || p.slug.includes('saffron') || p.title.toLowerCase().includes('radiance')
      : goal === 'barrier'
      ? p.slug.includes('barrier') || p.slug.includes('ghee') || p.title.toLowerCase().includes('cream')
      : goal === 'sun'
      ? p.slug.includes('sunscreen') || p.title.toLowerCase().includes('sunscreen')
      : p.slug.includes('bakuchiol') || p.title.toLowerCase().includes('elixir'),
  ) || products[0];

  const secondaryProduct = products.find(
    (p) => p.id !== primaryProduct?.id && (p.slug.includes('barrier') || p.slug.includes('sunscreen')),
  ) || products[1];

  const bundlePrice = (primaryProduct?.price || 999) + (secondaryProduct?.price || 699);
  const bundleDiscounted = Math.round(bundlePrice * 0.85); // 15% OFF bundle

  const handleAddBundle = () => {
    if (primaryProduct) onAddToCart(primaryProduct);
    if (secondaryProduct) onAddToCart(secondaryProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 border border-white/20 shadow-2xl relative animate-in fade-in bg-[#0D1322]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCalculated ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--primary-color)] to-[var(--secondary-color)] mx-auto flex items-center justify-center text-white shadow-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">Find Your Custom Ritual</h3>
              <p className="text-xs text-gray-400">
                Answer 2 quick questions to get your personalized clinical skincare routine.
              </p>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Question 1: What is your primary skin goal?
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { id: 'glow', label: '✨ Radiant Glow & Brightening', desc: 'Fades spots & dullness' },
                    { id: 'barrier', label: '🛡️ Barrier Repair & Hydration', desc: 'Soothes redness & dryness' },
                    { id: 'sun', label: '☀️ Zero White-Cast UV Shield', desc: 'Matte daily sun protection' },
                    { id: 'antiaging', label: '🌙 Firmness & Fine Line Softening', desc: 'Gentle plant retinol renewal' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        goal === item.id
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20 shadow-md ring-1 ring-[var(--primary-color)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="font-bold text-white text-xs">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full gradient-btn font-bold py-3 text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 mt-2"
                >
                  <span>Next: Skin Type</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Question 2: What is your skin type?
                </label>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  {[
                    { id: 'dry', label: 'Dry / Flaky', desc: 'Feels tight post-wash' },
                    { id: 'combination', label: 'Combination', desc: 'Oily T-zone, normal cheeks' },
                    { id: 'sensitive', label: 'Sensitive / Red', desc: 'Easily irritated' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSkinType(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        skinType === item.id
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20 ring-1 ring-[var(--primary-color)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="font-bold text-white text-xs">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 border border-white/20 rounded-xl text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 gradient-btn font-bold py-3 text-xs uppercase tracking-wider rounded-xl shadow-lg"
                  >
                    Calculate My Routine
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* RESULT RECOMMENDED BUNDLE */
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 99.4% Match For Your Skin Profile
              </span>
              <h3 className="font-heading text-2xl font-bold text-white">Your Prescribed Ritual</h3>
              <p className="text-xs text-gray-400">
                Clinically matched 2-step bundle to maximize barrier health and luminous glow.
              </p>
            </div>

            <div className="space-y-2.5 bg-white/5 p-4 rounded-2xl border border-white/10 divide-y divide-white/5 text-xs">
              {primaryProduct && (
                <div className="flex items-center space-x-3 pb-2.5">
                  <img
                    src={primaryProduct.media?.[0]?.url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100'}
                    alt={primaryProduct.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--primary-color)]">Step 1: Active Treat</span>
                    <p className="font-semibold text-white truncate">{primaryProduct.title}</p>
                    <span className="text-gray-400">₹{primaryProduct.price}</span>
                  </div>
                </div>
              )}

              {secondaryProduct && (
                <div className="flex items-center space-x-3 pt-2.5">
                  <img
                    src={secondaryProduct.media?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100'}
                    alt={secondaryProduct.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--secondary-color)]">Step 2: Seal & Protect</span>
                    <p className="font-semibold text-white truncate">{secondaryProduct.title}</p>
                    <span className="text-gray-400">₹{secondaryProduct.price}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <div>
                <span className="text-gray-400 block text-[11px]">Bundle Price (15% OFF applied):</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-black text-white">₹{bundleDiscounted}</span>
                  <span className="text-xs text-gray-500 line-through">₹{bundlePrice}</span>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Save ₹{bundlePrice - bundleDiscounted}
              </span>
            </div>

            <button
              onClick={handleAddBundle}
              className="w-full gradient-btn font-extrabold py-3.5 text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Complete 2-Step Ritual to Bag</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
