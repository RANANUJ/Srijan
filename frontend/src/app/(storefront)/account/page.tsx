'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  customerLogin,
  getCustomerProfile,
  getCustomerOrders,
  addCustomerAddress,
  deleteCustomerAddress,
  trackShipmentAwb,
  getTenantTheme,
  fetchFromApi,
} from '@/lib/api';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import {
  User,
  ShoppingBag,
  MapPin,
  Truck,
  FileText,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  ChevronRight,
  X,
  Phone,
  Mail,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const [currentTenantSlug, setCurrentTenantSlug] = useState('aura-beauty');
  const [theme, setTheme] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auth State
  const [token, setToken] = useState<string>('');
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginEmail, setLoginEmail] = useState('customer@example.com');
  const [loginName, setLoginName] = useState('Aarav Sharma');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [trackingModalData, setTrackingModalData] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: 'Aarav Sharma',
    phone: '9876543210',
    address_line1: 'B-402, Lotus Grandeur, Veera Desai Road',
    address_line2: 'Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    is_default: true,
  });

  // Load theme and auth on mount or tenant switch
  useEffect(() => {
    async function init() {
      try {
        const themeData = await getTenantTheme(currentTenantSlug);
        setTheme(themeData);
      } catch (err) {
        console.error('Failed to load theme:', err);
      }

      const savedToken = localStorage.getItem(`shopper_token_${currentTenantSlug}`);
      if (savedToken) {
        setToken(savedToken);
        loadCustomerData(savedToken);
      } else {
        setLoading(false);
      }
    }
    init();
  }, [currentTenantSlug]);

  async function loadCustomerData(shopperToken: string) {
    setLoading(true);
    try {
      const profile = await getCustomerProfile(currentTenantSlug, shopperToken);
      setCustomer(profile);
      const customerOrders = await getCustomerOrders(currentTenantSlug, shopperToken);
      setOrders(customerOrders);
    } catch (err) {
      console.error('Failed to load customer profile:', err);
      localStorage.removeItem(`shopper_token_${currentTenantSlug}`);
      setToken('');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await customerLogin(currentTenantSlug, {
        phone: loginPhone,
        email: loginEmail,
        name: loginName,
      });

      if (res.access_token) {
        localStorage.setItem(`shopper_token_${currentTenantSlug}`, res.access_token);
        setToken(res.access_token);
        await loadCustomerData(res.access_token);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`shopper_token_${currentTenantSlug}`);
    setToken('');
    setCustomer(null);
    setOrders([]);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCustomerAddress(currentTenantSlug, token, newAddress);
      setIsAddressModalOpen(false);
      await loadCustomerData(token);
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await deleteCustomerAddress(currentTenantSlug, token, id);
      await loadCustomerData(token);
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleViewInvoice = async (orderId: string) => {
    try {
      const invoice = await fetchFromApi(`/orders/${orderId}/invoice`, {
        tenantSlug: currentTenantSlug,
      });
      setSelectedInvoice(invoice);
    } catch (err) {
      alert('Invoice generation failed');
    }
  };

  const handleLiveTracking = async (awb: string) => {
    try {
      const tracking = await trackShipmentAwb(currentTenantSlug, awb);
      setTrackingModalData(tracking);
    } catch (err) {
      setTrackingModalData({
        awb,
        courier: 'Shiprocket Express',
        currentStatus: 'IN_TRANSIT',
        checkpoints: [
          { status: 'MANIFESTED', activity: 'Manifested with Shiprocket', location: 'Warehouse Hub', timestamp: new Date().toISOString() },
          { status: 'SHIPPED', activity: 'Dispatched via Express Courier', location: 'Sorting Center', timestamp: new Date().toISOString() },
        ],
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case 'PACKED':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Package className="w-3 h-3" /> Packed</span>;
      default:
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col justify-between">
      <Header
        theme={theme}
        cartCount={0}
        onOpenCart={() => setIsCartOpen(true)}
        currentTenantSlug={currentTenantSlug}
        onSwitchTenant={(slug) => setCurrentTenantSlug(slug)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          {customer && (
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 border border-red-500/30 px-3 py-1 rounded-lg bg-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>

        {/* NOT LOGGED IN: Beautiful Customer Login Card */}
        {!token || !customer ? (
          <div className="max-w-md mx-auto my-8 glass-panel p-8 space-y-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--primary-color)] to-[var(--secondary-color)] mx-auto flex items-center justify-center text-white shadow-lg">
                <User className="w-6 h-6" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white">Shopper Account</h1>
              <p className="text-xs text-gray-400">
                Log in to check live order tracking, download tax invoices, and manage saved addresses.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp / Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs text-gray-400 font-mono">+91</span>
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>

              {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full gradient-btn font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {loginLoading ? 'Signing In...' : 'Access My Account'}
              </button>
            </form>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Instant test shopper available:</span>
              <button
                type="button"
                onClick={() => {
                  setLoginPhone('9876543210');
                  setLoginName('Aura VIP Shopper');
                  setLoginEmail('vip@aura-beauty.com');
                }}
                className="text-[var(--primary-color)] font-semibold hover:underline"
              >
                Fill Demo Credentials
              </button>
            </div>
          </div>
        ) : (
          /* LOGGED IN CUSTOMER DASHBOARD */
          <div className="space-y-6">
            {/* Header Hero Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-xl font-bold text-white shadow-xl">
                  {customer.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{customer.name || 'Shopper'}</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone || 'No phone'}</span>
                    {customer.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                <div className="text-center md:text-left">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Total Orders</span>
                  <span className="text-xl font-extrabold text-white">{orders.length}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center md:text-left">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Total Spent</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    ₹{orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 space-x-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'orders'
                    ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>My Orders ({orders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'addresses'
                    ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses ({customer.addresses?.length || 0})</span>
              </button>
            </div>

            {/* TAB CONTENT: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="glass-panel p-12 text-center space-y-4 rounded-2xl border border-white/10">
                    <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto" />
                    <h3 className="text-lg font-bold text-white">No Orders Yet</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Explore our products and place your first order with instant discounts and fast shipping!
                    </p>
                    <Link href="/" className="inline-block gradient-btn text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-gray-400">Order Number</span>
                          <p className="font-mono font-bold text-white text-sm">{order.order_number}</p>
                          <span className="text-[11px] text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.fulfillment_status)}
                          <span className="font-extrabold text-white text-base">
                            ₹{order.total_amount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-white/5">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-gray-400">
                                🛍️
                              </div>
                              <div>
                                <p className="font-semibold text-white">{item.product_title}</p>
                                <p className="text-[11px] text-gray-400">
                                  Qty: {item.quantity} · SKU: {item.sku}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-300">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions & Tracking Bar */}
                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {order.tracking_awb ? (
                            <button
                              onClick={() => handleLiveTracking(order.tracking_awb)}
                              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Package ({order.tracking_courier || 'Shiprocket'})</span>
                            </button>
                          ) : (
                            <span className="text-gray-500 text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Shipment preparing at warehouse
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(order.id)}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>Download Tax Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Delivery Addresses</h3>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="gradient-btn text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.addresses?.map((addr: any) => (
                    <div key={addr.id} className="glass-panel p-5 rounded-2xl border border-white/10 relative space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{addr.name}</span>
                        {addr.is_default && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300">{addr.address_line1}</p>
                      {addr.address_line2 && <p className="text-gray-400">{addr.address_line2}</p>}
                      <p className="text-gray-400 font-medium">
                        {addr.city}, {addr.state} - <span className="text-white font-mono">{addr.pincode}</span>
                      </p>
                      <p className="text-gray-400 flex items-center gap-1 pt-1">
                        <Phone className="w-3 h-3" /> {addr.phone}
                      </p>
                      <div className="pt-3 border-t border-white/10 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GST INVOICE MODAL */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl relative animate-in fade-in">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-purple-700">{selectedInvoice.brandName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">TAX INVOICE / BILL OF SUPPLY</p>
                  <p className="text-xs text-slate-500 font-mono">GSTIN: {selectedInvoice.gstin}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-sm block">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-xs text-slate-500">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-700">Customer Details:</p>
                <p className="font-medium text-slate-800">{selectedInvoice.customer.name} ({selectedInvoice.customer.phone})</p>
                <p className="text-slate-600">
                  {selectedInvoice.customer.address?.line1}, {selectedInvoice.customer.address?.city} - {selectedInvoice.customer.address?.pincode}
                </p>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="border-b text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">HSN</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{item.description}</td>
                      <td className="py-2 text-center text-slate-500">{item.hsnCode}</td>
                      <td className="py-2 text-center">{item.qty}</td>
                      <td className="py-2 text-right">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-3 space-y-1 text-xs text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxable Amount:</span>
                  <span className="font-medium">₹{selectedInvoice.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CGST (9%):</span>
                  <span className="font-medium">₹{selectedInvoice.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SGST (9%):</span>
                  <span className="font-medium">₹{selectedInvoice.sgst.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount:</span>
                    <span>-₹{selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-2 text-slate-900">
                  <span>Grand Total:</span>
                  <span>₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHIPMENT LIVE TRACKING MODAL */}
        {trackingModalData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl max-w-lg w-full space-y-5 border border-white/20 shadow-2xl relative animate-in fade-in">
              <button
                onClick={() => setTrackingModalData(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Live Courier Tracking</h3>
                  <p className="text-xs text-gray-400">
                    Courier: <span className="text-white font-semibold">{trackingModalData.courier}</span> · AWB:{' '}
                    <span className="font-mono text-cyan-400">{trackingModalData.awb}</span>
                  </p>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-4 py-2">
                {trackingModalData.checkpoints?.map((cp: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{cp.activity}</p>
                      <p className="text-[11px] text-gray-400">{cp.location}</p>
                      <span className="text-[10px] text-gray-500">{new Date(cp.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-400">Estimated Delivery:</span>
                <span className="font-bold text-emerald-400">{trackingModalData.estimatedDelivery || 'In 1-2 Business Days'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ADD ADDRESS MODAL */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl max-w-md w-full space-y-4 border border-white/20 shadow-2xl relative">
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-white text-base">Add New Shipping Address</h3>

              <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Address (House / Flat / Street)</label>
                  <input
                    type="text"
                    required
                    value={newAddress.address_line1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full gradient-btn font-bold py-2.5 rounded-xl uppercase tracking-wider mt-4"
                >
                  Save Address
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer theme={theme} />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={[]}
        onUpdateQty={() => {}}
        onRemoveItem={() => {}}
        currentTenantSlug={currentTenantSlug}
      />
    </div>
  );
}
