'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';

interface ToastData {
  name: string;
  location: string;
  product: string;
  timeAgo: string;
  image: string;
}

const PURCHASES: ToastData[] = [
  {
    name: 'Pooja S.',
    location: 'Indiranagar, Bengaluru',
    product: 'Radiance 15% Vitamin C Glow Serum',
    timeAgo: '3 mins ago',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rhea M.',
    location: 'Bandra West, Mumbai',
    product: 'Hydra-Barrier 5-Ceramide Glaze Cream',
    timeAgo: '7 mins ago',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Ananya V.',
    location: 'Greater Kailash, New Delhi',
    product: 'Velvet Petal Invisible Gel Sunscreen SPF 50+',
    timeAgo: '12 mins ago',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=100&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sanya K.',
    location: 'Jubilee Hills, Hyderabad',
    product: 'Moonlit 2% Bakuchiol Night Elixir',
    timeAgo: '16 mins ago',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=100&auto=format&fit=crop&q=80',
  },
];

export function LivePurchaseToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show after 4 seconds initial delay
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    // Cycle every 11 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PURCHASES.length);
        setIsVisible(true);
      }, 800);
    }, 11000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed || !isVisible) return null;

  const current = PURCHASES[currentIndex];

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm glass-panel-elevated p-3.5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-500 flex items-center space-x-3 text-xs bg-[#0B0F19]/90">
      <img
        src={current.image}
        alt={current.product}
        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
      />
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center space-x-1.5 text-[11px] text-gray-300">
          <span className="font-bold text-white truncate">{current.name}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-400 text-[10px] truncate">{current.location}</span>
        </div>
        <p className="text-[11px] font-semibold text-emerald-400 truncate mt-0.5">
          Purchased {current.product}
        </p>
        <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Verified Buyer · {current.timeAgo}
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="text-gray-400 hover:text-white p-1"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
