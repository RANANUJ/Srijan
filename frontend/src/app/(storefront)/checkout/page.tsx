'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { initiateCheckout, verifyPayment, getTenantProducts } from '@/lib/api';
import { ShieldCheck, Lock, CreditCard, Truck, CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [customerName, setCustomerName] = useState('Pooja Patel');
  const [customerEmail, setCustomerEmail] = useState('pooja@example.com');
  const [customerPhone, setCustomerPhone] = useState('9876543210');

  const [addressLine1, setAddressLine1] = useState('Flat 402, Sunshine Heights, Veera Desai Road');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400053');

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Load cart from localStorage or fallback to tenant catalog
  useEffect(() => {
    try {
      const stored = localStorage.getItem('srijan_cart');
      const coupon = localStorage.getItem('srijan_coupon');
      if (coupon) setCouponCode(coupon);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
          return;
        }
      }
    } catch {}

    // Fallback: fetch products and populate 1 sample item
    async function loadFallback() {
      try {
        const prods = await getTenantProducts(tenantSlug);
        if (prods && prods.length > 0) {
          const first = prods[0];
          setCartItems([
            {
              productId: first.id,
              variantId: first.variants?.[0]?.id,
              title: first.title,
              variantTitle: first.variants?.[0]?.title,
              price: first.price,
              quantity: 1,
              imageUrl: first.media?.[0]?.url,
            },
          ]);
        }
      } catch {}
    }
    loadFallback();
  }, [tenantSlug]);

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = couponCode ? Math.round(rawSubtotal * 0.2) : 0; // 20% discount if coupon
  const shippingFee = rawSubtotal >= 799 || rawSubtotal === 0 ? 0 : 70;
  const totalAmount = Math.max(0, rawSubtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          line1: addressLine1,
          city,
          state,
          pincode,
        },
        couponCode: couponCode || undefined,
        paymentMethod,
      };

      const res = await initiateCheckout(tenantSlug, payload);

      if (paymentMethod === 'RAZORPAY') {
        const verification = await verifyPayment(tenantSlug, {
          orderId: res.orderId,
          razorpayPaymentId: `pay_${Math.random().toString(36).substring(7)}`,
        });
        setOrderSuccess({ ...res, ...verification });
      } else {
        setOrderSuccess(res);
      }

      // Clear cart
      try {
        localStorage.removeItem('srijan_cart');
        localStorage.removeItem('srijan_coupon');
      } catch {}

      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </Link>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {orderSuccess ? (
          <div className="glass-panel p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-500 rounded-3xl border border-white/20 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-3xl font-extrabold text-white">Order Confirmed!</h2>
              <p className="text-xs text-gray-300">
                Thank you, <b>{customerName}</b>. Your order details and tracking updates have been sent to{' '}
                <span className="text-white font-mono">{customerPhone}</span>.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Number:</span>
                <span className="font-mono font-bold text-white text-sm">{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status:</span>
                <span className="font-bold text-emerald-400 uppercase">{orderSuccess.status || 'PAID'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="font-bold text-white">₹{orderSuccess.totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/account"
                className="flex-1 gradient-btn py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-center shadow-lg"
              >
                View in My Account
              </Link>
              <Link
                href="/track-order"
                className="px-5 py-3 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white text-center"
              >
                Track Live Shipment
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Customer & Shipping Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel p-6 space-y-4 rounded-2xl border border-white/10">
                <h3 className="font-heading text-lg font-bold text-white">1. Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp Phone</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 space-y-4 rounded-2xl border border-white/10">
                <h3 className="font-heading text-lg font-bold text-white">2. Shipping Destination</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Address (House / Flat / Road)</label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method & Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel p-6 space-y-4 rounded-2xl border border-white/10">
                <h3 className="font-heading text-lg font-bold text-white">3. Payment Option</h3>

                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 ring-1 ring-[var(--primary-color)]'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'RAZORPAY'}
                        onChange={() => setPaymentMethod('RAZORPAY')}
                        className="accent-[var(--primary-color)]"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1">
                          <CreditCard className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                          <span>Razorpay Secure Online</span>
                        </div>
                        <p className="text-[10px] text-gray-400">UPI (GPay/PhonePe), Cards, NetBanking</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 ring-1 ring-[var(--primary-color)]'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-[var(--primary-color)]"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1">
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Pay cash upon delivery at doorstep</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Items Summary */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-xs font-bold text-gray-300 block">Order Summary ({cartItems.length} items)</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                            {item.quantity}×
                          </span>
                          <span className="text-gray-300 truncate">{item.title}</span>
                        </div>
                        <span className="text-white font-semibold shrink-0">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Calculations */}
                <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{rawSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({couponCode})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Express Shipping</span>
                    <span>{shippingFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                    <span>Total Amount</span>
                    <span className="text-[var(--primary-color)]">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full gradient-btn py-3.5 text-xs font-bold uppercase tracking-wider shadow-xl active:scale-95 transition-all mt-2"
                >
                  {loading ? 'Processing Order...' : `Pay & Complete Order • ₹${totalAmount}`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
