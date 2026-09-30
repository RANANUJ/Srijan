'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getShippingConfig,
  saveShippingConfig,
  calculateShippingRates,
  dispatchOrderShiprocket,
  fetchFromApi,
} from '@/lib/api';
import {
  Truck,
  Package,
  Calculator,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function ShippingLogisticsPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  // Config State
  const [config, setConfig] = useState<any>({
    email: 'logistics@aura-beauty.com',
    api_token: 'sr_live_verified_token_883',
    pickup_pincode: '400001',
    pickup_location: 'Mumbai Central Warehouse',
    is_enabled: true,
    auto_generate_awb: true,
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Rate Calculator State
  const [calcSourcePin, setCalcSourcePin] = useState('400001');
  const [calcDestPin, setCalcDestPin] = useState('110001');
  const [calcWeight, setCalcWeight] = useState(0.5);
  const [calcIsCod, setCalcIsCod] = useState(false);
  const [calcResults, setCalcResults] = useState<any[]>([]);
  const [calcLoading, setCalcLoading] = useState(false);

  // Orders Dispatch Queue
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Dispatch & Label Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dispatchCourier, setDispatchCourier] = useState('Delhivery Surface Express');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [generatedLabel, setGeneratedLabel] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [tenantSlug]);

  async function loadData() {
    setOrdersLoading(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const cfg = await getShippingConfig(tenantSlug, token);
      if (cfg) setConfig(cfg);
    } catch (err) {
      console.error('Config fetch failed:', err);
    }

    try {
      const ordersData = await fetchFromApi('/orders', { tenantSlug, token });
      setOrders(ordersData);
    } catch (err) {
      console.error('Orders fetch failed:', err);
    } finally {
      setOrdersLoading(false);
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      await saveShippingConfig(tenantSlug, token, config);
      setConfigSavedNotice(true);
      setTimeout(() => setConfigSavedNotice(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save Shiprocket settings');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleCalculateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await calculateShippingRates(tenantSlug, {
        pickupPincode: calcSourcePin,
        deliveryPincode: calcDestPin,
        weightKg: calcWeight,
        isCod: calcIsCod,
      });
      setCalcResults(res.couriers || []);
    } catch (err: any) {
      alert(err.message || 'Pincode not serviceable');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleDispatchOrder = async () => {
    if (!selectedOrder) return;
    setDispatchLoading(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const res = await dispatchOrderShiprocket(tenantSlug, token, {
        orderId: selectedOrder.id,
        courierName: dispatchCourier,
        weightKg: 0.5,
      });
      setGeneratedLabel(res.label);
      setSelectedOrder(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch shipment');
    } finally {
      setDispatchLoading(false);
    }
  };

  const unfulfilledOrders = orders.filter(
    (o) => o.fulfillment_status === 'UNFULFILLED' || o.fulfillment_status === 'CONFIRMED' || o.fulfillment_status === 'PACKED'
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
                  <span>Shiprocket Shipping & Logistics Engine</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Connected
                  </span>
                </h1>
                <p className="text-xs text-gray-400">
                  Automate AWB generation, multi-carrier rate calculation, label printing, and live buyer tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/orders?tenant=${tenantSlug}`}
              className="text-xs text-gray-300 hover:text-white border border-white/10 px-4 py-2 rounded-xl bg-white/5 flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>All Orders ({orders.length})</span>
            </Link>
          </div>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Ready for Dispatch</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">{unfulfilledOrders.length}</p>
            <span className="text-[11px] text-amber-400">Pending courier pickup</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Active In-Transit Shipments</span>
              <Truck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-cyan-400">
              {orders.filter((o) => o.fulfillment_status === 'SHIPPED').length}
            </p>
            <span className="text-[11px] text-gray-400">Delhivery, BlueDart, Shadowfax</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Delivered Successfully</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">
              {orders.filter((o) => o.fulfillment_status === 'DELIVERED').length}
            </p>
            <span className="text-[11px] text-emerald-400">0% RTO rate</span>
          </div>
        </div>

        {/* Split Grid: Shiprocket Config & Live Rate Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shiprocket API Credentials & Settings */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-base">Shiprocket API Configuration</h3>
              </div>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                AES-256 Encrypted
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block font-medium mb-1">Shiprocket Registered Email</label>
                <input
                  type="email"
                  required
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 block font-medium mb-1">API Token / Live Secret</label>
                <input
                  type="password"
                  value={config.api_token}
                  onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 block font-medium mb-1">Pickup Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={config.pickup_pincode}
                    onChange={(e) => setConfig({ ...config, pickup_pincode: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block font-medium mb-1">Warehouse Name</label>
                  <input
                    type="text"
                    required
                    value={config.pickup_location}
                    onChange={(e) => setConfig({ ...config, pickup_location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.is_enabled}
                    onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                    className="rounded border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="text-gray-300">Enable Automated Shiprocket Order Manifestation</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.auto_generate_awb}
                    onChange={(e) => setConfig({ ...config, auto_generate_awb: e.target.checked })}
                    className="rounded border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="text-gray-300">Auto-assign fastest courier & generate AWB on checkout</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={configSaving}
                  className="gradient-btn font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2"
                >
                  {configSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{configSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>
                {configSavedNotice && (
                  <span className="text-xs text-emerald-400 font-medium">✓ Credentials updated successfully!</span>
                )}
              </div>
            </form>
          </div>

          {/* Live Multi-Carrier Rate Calculator */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Live Courier Rate Calculator</h3>
              </div>
              <span className="text-[11px] text-gray-400">Pincode Check</span>
            </div>

            <form onSubmit={handleCalculateRates} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Pickup PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={calcSourcePin}
                  onChange={(e) => setCalcSourcePin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Delivery PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={calcDestPin}
                  onChange={(e) => setCalcDestPin(e.target.value)}
                  placeholder="e.g. 560001"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Weight (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="20"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={calcLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 font-bold p-2.5 rounded-xl text-white transition-colors"
                >
                  {calcLoading ? 'Checking...' : 'Check Rates'}
                </button>
              </div>
            </form>

            {/* Courier Comparison Table */}
            <div className="space-y-2 pt-2">
              {calcResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                  Enter pickup & destination pincodes to compare live delivery rates and transit times across Indian couriers.
                </div>
              ) : (
                <div className="divide-y divide-white/5 text-xs">
                  {calcResults.map((c) => (
                    <div key={c.courierId} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{c.courierName}</span>
                          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                            {c.mode}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Est. Transit: <span className="text-cyan-400 font-medium">{c.estimatedDeliveryDays} Days</span> · ⭐ {c.rating}/5
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-white text-sm">₹{c.rate}</span>
                        <span className="text-[10px] text-gray-500 block">+ GST</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dispatch Queue Table */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Orders Awaiting Shipment ({unfulfilledOrders.length})</span>
              </h3>
              <p className="text-xs text-gray-400">
                Click "Dispatch Shipment" to automatically book courier pickup, generate AWB, and create printable shipping labels.
              </p>
            </div>
          </div>

          {unfulfilledOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-bold text-white">All Caught Up!</p>
              <p>No orders are currently pending fulfillment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unfulfilledOrders.map((order) => {
                    let addr = { city: 'Mumbai', state: 'MH', pincode: '400053' };
                    try {
                      addr = JSON.parse(order.shipping_address_json);
                    } catch {}

                    return (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {order.order_number}
                          <span className="block text-[10px] text-gray-500 font-sans">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">{order.customer_name}</p>
                          <p className="text-[11px] text-gray-400">{order.customer_phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-white">{addr.city}, {addr.state}</p>
                          <span className="text-[11px] font-mono text-cyan-400">{addr.pincode}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {order.items?.length || 1} item(s)
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          ₹{order.total_amount?.toLocaleString('en-IN')}
                          <span className="block text-[10px] text-gray-500 font-normal">{order.payment_method}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Ship via Shiprocket</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: DISPATCH ORDER WITH SHIPROCKET */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-5 border border-white/20 shadow-2xl relative animate-in fade-in">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Manifest Order with Courier</h3>
                  <p className="text-xs text-gray-400">Order: <span className="font-mono text-white">{selectedOrder.order_number}</span></p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Select Courier Partner</label>
                  <select
                    value={dispatchCourier}
                    onChange={(e) => setDispatchCourier(e.target.value)}
                    className="w-full bg-[#131b2e] border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Delhivery Surface Express">Delhivery Surface Express (Fastest Surface · ₹45)</option>
                    <option value="Blue Dart Air Priority">Blue Dart Air Priority (1-Day Express Air · ₹85)</option>
                    <option value="Shadowfax D2C Connect">Shadowfax D2C Connect (Hyperlocal/Standard · ₹55)</option>
                    <option value="DTDC Standard Economy">DTDC Standard Economy (Economy · ₹40)</option>
                  </select>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                  <p className="text-gray-400">Shipping To:</p>
                  <p className="font-bold text-white">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
                  <p className="text-gray-300">
                    {(() => {
                      try {
                        const a = JSON.parse(selectedOrder.shipping_address_json);
                        return `${a.line1}, ${a.city}, ${a.state} - ${a.pincode}`;
                      } catch {
                        return 'Address on file';
                      }
                    })()}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-400">Payment:</span>
                  <span className="font-bold text-emerald-400 uppercase">{selectedOrder.payment_method} · ₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              <button
                onClick={handleDispatchOrder}
                disabled={dispatchLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {dispatchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                <span>{dispatchLoading ? 'Manifesting with Shiprocket...' : 'Generate AWB & Confirm Pickup'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PRINTABLE SHIPPING LABEL MODAL */}
        {generatedLabel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl relative animate-in fade-in">
              <button
                onClick={() => setGeneratedLabel(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-2 border-black p-4 space-y-4">
                {/* Top Courier Strip */}
                <div className="flex justify-between items-center border-b-2 border-black pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">Logistics Partner</span>
                    <span className="text-lg font-black text-slate-900">{generatedLabel.courier}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase text-slate-500 block">AWB Tracking #</span>
                    <span className="text-base font-mono font-black text-slate-900">{generatedLabel.awb}</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="text-center py-2 bg-slate-100 border border-slate-300">
                  <div className="font-mono text-2xl tracking-[0.3em] font-black">{generatedLabel.barcodeData}</div>
                  <div className="text-xs font-mono tracking-widest mt-1 text-slate-600">{generatedLabel.awb}</div>
                </div>

                {/* To & From Addresses */}
                <div className="grid grid-cols-2 gap-4 text-xs border-y-2 border-black py-3">
                  <div>
                    <span className="font-bold uppercase text-slate-500 block text-[10px]">Deliver To:</span>
                    <p className="font-bold text-slate-900">{generatedLabel.customer.name}</p>
                    <p className="text-slate-700">{generatedLabel.customer.address}</p>
                    <p className="text-slate-700">{generatedLabel.customer.city}, {generatedLabel.customer.state}</p>
                    <p className="font-black text-sm text-slate-900">PIN: {generatedLabel.customer.pincode}</p>
                    <p className="text-slate-600">Mob: {generatedLabel.customer.phone}</p>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-slate-500 block text-[10px]">Shipped By:</span>
                    <p className="font-bold text-slate-900">Srijan Brand Hub</p>
                    <p className="text-slate-600">Central Fulfillment Center</p>
                    <p className="text-slate-600">Mumbai, Maharashtra - 400001</p>
                    <p className="font-bold text-slate-800 mt-2">Order: {generatedLabel.orderNumber}</p>
                  </div>
                </div>

                {/* Order Summary & Collectible Amount */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500">Payment:</span>{' '}
                    <span className="font-bold uppercase">{generatedLabel.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Collect Amount:</span>{' '}
                    <span className="text-base font-black text-slate-900">
                      {generatedLabel.paymentMethod === 'COD' ? `₹${generatedLabel.totalAmount}` : '₹0 (PREPAID)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Shipping Label</span>
                </button>
                <button
                  onClick={() => setGeneratedLabel(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
