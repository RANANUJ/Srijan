'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFromApi, updateOrderFulfillment } from '@/lib/api';
import { ShoppingBag, FileText, Truck, CheckCircle2, Search, X } from 'lucide-react';

export default function OrdersManagerPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, [tenantSlug]);

  async function loadOrders() {
    setLoading(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const data = await fetchFromApi('/orders', { tenantSlug, token });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateFulfillment = async (orderId: string, status: string) => {
    const token = localStorage.getItem('srijan_token') || '';
    const awb = prompt('Enter Courier Tracking AWB number:', `AWB-${Math.floor(100000 + Math.random() * 900000)}`);
    
    try {
      await updateOrderFulfillment(tenantSlug, token, orderId, status, {
        awb: awb || undefined,
        courier: 'Shiprocket Express',
      });
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const inv = await fetchFromApi(`/orders/${orderId}/invoice`, { tenantSlug, token });
      setSelectedInvoice(inv);
    } catch (err: any) {
      alert('Failed to generate invoice');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              <span>Orders & GST Invoice Manager</span>
            </h1>
            <p className="text-xs text-gray-400">Process fulfillment status, write audit logs, and issue tax invoices</p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={`/admin/shipping?tenant=${tenantSlug}`}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Shiprocket Automation</span>
            </a>
          </div>
        </div>

        {/* Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl relative">
              <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>

              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-purple-700">{selectedInvoice.brandName}</h3>
                  <p className="text-xs text-slate-500">TAX INVOICE / BILL OF SUPPLY</p>
                  <p className="text-xs text-slate-500 font-mono">GSTIN: {selectedInvoice.gstin}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-sm block">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-xs text-slate-500">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded border">
                <p className="font-bold text-slate-700">Billed To:</p>
                <p>{selectedInvoice.customer.name} ({selectedInvoice.customer.phone})</p>
                <p>{selectedInvoice.customer.address?.line1}, {selectedInvoice.customer.address?.city}, {selectedInvoice.customer.address?.pincode}</p>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="border-b text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2">Item</th>
                    <th className="py-2">HSN</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedInvoice.items.map((i: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{i.description}</td>
                      <td className="py-2 text-slate-500">{i.hsnCode}</td>
                      <td className="py-2">{i.qty}</td>
                      <td className="py-2 text-right font-bold">₹{i.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-3 space-y-1 text-xs text-slate-600 text-right">
                <div>Taxable Amount: <b>₹{selectedInvoice.taxableAmount}</b></div>
                <div>CGST (9%): <b>₹{selectedInvoice.cgst}</b></div>
                <div>SGST (9%): <b>₹{selectedInvoice.sgst}</b></div>
                <div className="text-sm font-bold text-slate-900 pt-1 border-t">Total Amount: <b>₹{selectedInvoice.totalAmount}</b></div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="glass-panel p-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-white/10 text-gray-400 font-semibold uppercase">
                  <tr>
                    <th className="py-3">Order Number</th>
                    <th className="py-3">Customer Contact</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Fulfillment Status</th>
                    <th className="py-3">Total</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-bold text-purple-400">{o.order_number}</td>
                      <td className="py-3">
                        <div className="font-bold text-white">{o.customer_name}</div>
                        <div className="text-gray-400">{o.customer_phone}</div>
                      </td>
                      <td className="py-3"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">{o.payment_status}</span></td>
                      <td className="py-3"><span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">{o.fulfillment_status}</span></td>
                      <td className="py-3 font-extrabold text-white">₹{o.total_amount}</td>
                      <td className="py-3 text-right space-x-2">
                        <button onClick={() => handleGenerateInvoice(o.id)} className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded text-[11px] font-semibold text-white">
                          GST Invoice
                        </button>
                        <button onClick={() => handleUpdateFulfillment(o.id, 'SHIPPED')} className="gradient-btn px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">
                          Ship Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
