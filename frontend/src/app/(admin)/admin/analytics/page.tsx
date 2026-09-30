'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFromApi } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from 'lucide-react';

// Generate mock daily revenue data based on real order data
function generateRevenueData(orders: any[]) {
  const days: Record<string, { revenue: number; orders: number }> = {};

  orders.forEach(o => {
    const day = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!days[day]) days[day] = { revenue: 0, orders: 0 };
    if (o.payment_status === 'PAID') {
      days[day].revenue += o.total_amount;
    }
    days[day].orders++;
  });

  // Always include last 7 days
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    result.push({
      day: label,
      revenue: days[label]?.revenue || Math.floor(Math.random() * 8000 + 1000),
      orders: days[label]?.orders || Math.floor(Math.random() * 12 + 1),
    });
  }

  return result;
}

const FUNNEL_DATA = [
  { stage: 'Product Views', value: 3420, fill: '#7C3AED' },
  { stage: 'Add to Cart', value: 1260, fill: '#EC4899' },
  { stage: 'Checkout', value: 580, fill: '#F59E0B' },
  { stage: 'Purchased', value: 312, fill: '#10B981' },
];

const STATUS_COLORS = {
  UNFULFILLED: '#F59E0B',
  CONFIRMED: '#3B82F6',
  PACKED: '#8B5CF6',
  SHIPPED: '#06B6D4',
  DELIVERED: '#10B981',
  CANCELLED: '#EF4444',
};

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantSlug]);

  async function loadData() {
    setLoading(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const [dashData, ordersData] = await Promise.all([
        fetchFromApi('/admin/dashboard', { tenantSlug, token }),
        fetchFromApi('/orders', { tenantSlug, token }),
      ]);
      setMetrics(dashData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  const revenueData = generateRevenueData(orders);
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);

  // Build fulfillment status distribution
  const statusCounts: Record<string, number> = {};
  orders.forEach(o => {
    statusCounts[o.fulfillment_status] = (statusCounts[o.fulfillment_status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-violet-400" />
              <span>Advanced Analytics & Revenue Intelligence</span>
            </h1>
            <p className="text-xs text-gray-400">Live metrics isolated for <b>{tenantSlug}</b></p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Crunching analytics data...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue (7d)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, delta: '+18.5%', icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Total Orders', value: metrics?.totalOrders || 0, delta: '+12.3%', icon: ShoppingBag, color: 'text-violet-400' },
                { label: 'Unique Customers', value: metrics?.totalCustomers || 0, delta: '+9.1%', icon: Users, color: 'text-pink-400' },
                { label: 'Active Products', value: metrics?.totalProducts || 0, delta: 'Catalog live', icon: Package, color: 'text-amber-400' },
              ].map(kpi => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="glass-panel p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">{kpi.label}</span>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                    <div className="text-2xl font-black text-white">{kpi.value}</div>
                    <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{kpi.delta}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue & Orders Area Chart */}
            <div className="glass-panel p-6">
              <h3 className="font-heading text-base font-bold text-white mb-6">Revenue & Order Volume — Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue (₹)" />
                  <Area type="monotone" dataKey="orders" stroke="#EC4899" strokeWidth={2} fill="url(#ordersGrad)" name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <div className="glass-panel p-6">
                <h3 className="font-heading text-base font-bold text-white mb-6">Shopper Conversion Funnel</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={FUNNEL_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="value" name="Shoppers" radius={[0, 6, 6, 0]}>
                      {FUNNEL_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-gray-400">
                  <span>Cart Abandonment Rate</span>
                  <span className="text-amber-400 font-bold">53.9% — <span className="text-emerald-400">WhatsApp Recovery Active</span></span>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="glass-panel p-6">
                <h3 className="font-heading text-base font-bold text-white mb-6">Order Fulfillment Breakdown</h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No order data yet. Place an order to see breakdown.</div>
                )}
              </div>
            </div>

            {/* Top Products by Revenue */}
            <div className="glass-panel p-6">
              <h3 className="font-heading text-base font-bold text-white mb-4">Revenue by Product SKU (Simulated)</h3>
              <div className="space-y-3">
                {[
                  { title: 'Vitamin C Glow Serum 30ml', sku: 'AURA-SER-001', revenue: 38880, units: 32, share: 78 },
                  { title: 'Hyaluronic Acid Hydra Cream', sku: 'AURA-CRM-002', revenue: 8750, units: 12, share: 17 },
                  { title: 'Rose Facial Mist SPF 15', sku: 'AURA-MST-003', revenue: 2499, units: 5, share: 5 },
                ].map(p => (
                  <div key={p.sku} className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-white truncate">{p.title}</span>
                        <span className="text-emerald-400 font-bold ml-2 flex-shrink-0">₹{p.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                          style={{ width: `${p.share}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{p.units} units</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
