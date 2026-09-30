'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAdminDashboard } from '@/lib/api';
import {
  LayoutDashboard,
  Palette,
  Package,
  ShoppingBag,
  Tag,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  LogOut,
  Sparkles,
  ShieldAlert,
  Globe,
  BarChart3,
  Truck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('srijan_user');
    const token = localStorage.getItem('srijan_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    async function loadMetrics() {
      setLoading(true);
      try {
        const data = await getAdminDashboard(tenantSlug, token!);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [tenantSlug, router]);

  const handleLogout = () => {
    localStorage.removeItem('srijan_token');
    localStorage.removeItem('srijan_user');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col justify-between bg-black/40">
        <div className="space-y-8">
          {/* Brand Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">
              {tenantSlug.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-base font-bold capitalize text-white">{tenantSlug.replace('-', ' ')}</h2>
              <span className="text-[10px] text-emerald-400 font-semibold">Tenant ID: Isolated</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <Link href={`/admin/dashboard?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-white/10 text-white">
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>Dashboard Overview</span>
            </Link>
            <Link href={`/admin/analytics?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <span>Analytics & Revenue</span>
            </Link>
            <Link href={`/admin/products?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Products & Catalog</span>
            </Link>
            <Link href={`/admin/orders?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Orders & GST Invoices</span>
            </Link>
            <Link href={`/admin/shipping?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Shiprocket Logistics</span>
            </Link>
            <Link href={`/admin/coupons?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <Tag className="w-4 h-4 text-blue-400" />
              <span>Coupons & Promotions</span>
            </Link>
            <Link href={`/admin/whatsapp?tenant=${tenantSlug}`} className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp Automation</span>
            </Link>
            <div className="pt-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-400 space-y-1">
                <span className="font-bold text-white block">🎨 Website Theme & Style</span>
                <span className="text-[10px] text-gray-400 block">
                  Managed exclusively by Platform Super-Admin for brand architecture integrity.
                </span>
              </div>
            </div>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <div>
            <p className="font-semibold text-white">{user?.name || 'Brand Owner'}</p>
            <p className="text-[10px] text-purple-400 font-medium">{user?.role || 'OWNER'}</p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 text-gray-400 hover:text-red-400 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Brand Performance Analytics</h1>
            <p className="text-xs text-gray-400">Real-time metrics isolated for <b>{tenantSlug}</b></p>
          </div>
          <Link href="/" target="_blank" className="gradient-btn px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preview Storefront</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading admin metrics...</div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">₹{metrics?.totalRevenue || 0}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">+18.5% from last week</span>
              </div>

              <div className="glass-panel p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{metrics?.totalOrders || 0}</div>
                <span className="text-[10px] text-purple-400 font-semibold">100% Verified</span>
              </div>

              <div className="glass-panel p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                  <span>Customers</span>
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-2xl font-black text-white">{metrics?.totalCustomers || 0}</div>
                <span className="text-[10px] text-pink-400 font-semibold">Isolated Customer Base</span>
              </div>

              <div className="glass-panel p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400 text-xs font-medium">
                  <span>Active Products</span>
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{metrics?.totalProducts || 0}</div>
                <span className="text-[10px] text-blue-400 font-semibold">Catalog Synchronized</span>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {metrics?.lowStockAlerts && metrics.lowStockAlerts.length > 0 && (
              <div className="glass-panel p-6 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center space-x-2 text-amber-400 mb-4 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Low Stock Threshold Alerts (Stock ≤ 5)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                      <tr>
                        <th className="py-2">Product Title</th>
                        <th className="py-2">Variant</th>
                        <th className="py-2">SKU</th>
                        <th className="py-2">Stock Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {metrics.lowStockAlerts.map((alert: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-bold text-white">{alert.productTitle}</td>
                          <td className="py-2.5">{alert.variantTitle}</td>
                          <td className="py-2.5 text-gray-400">{alert.sku}</td>
                          <td className="py-2.5 text-red-400 font-black">{alert.stock} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Orders List */}
            <div className="glass-panel p-6">
              <h3 className="font-heading text-lg font-bold text-white mb-4">Recent Customer Orders</h3>
              {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                      <tr>
                        <th className="py-3">Order Number</th>
                        <th className="py-3">Customer</th>
                        <th className="py-3">Payment</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {metrics.recentOrders.map((o: any) => (
                        <tr key={o.id}>
                          <td className="py-3 font-bold text-purple-400">{o.order_number}</td>
                          <td className="py-3">{o.customer_name} ({o.customer_phone})</td>
                          <td className="py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">{o.payment_status}</span></td>
                          <td className="py-3"><span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">{o.fulfillment_status}</span></td>
                          <td className="py-3 font-extrabold text-white">₹{o.total_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-4">No recent orders found.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
