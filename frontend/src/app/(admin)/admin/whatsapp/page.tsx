'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { configureWhatsApp, getWhatsAppLogs, fetchFromApi } from '@/lib/api';
import { MessageCircle, Send, ShieldCheck, Check } from 'lucide-react';

export default function WhatsAppManagerPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [phoneId, setPhoneId] = useState('10982347891234');
  const [token, setToken] = useState('EAAGk...sample_encrypted_meta_token');
  const [testPhone, setTestPhone] = useState('9876543210');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadLogs();
  }, [tenantSlug]);

  async function loadLogs() {
    setLoading(true);
    const jwtToken = localStorage.getItem('srijan_token') || '';
    try {
      const data = await getWhatsAppLogs(tenantSlug, jwtToken);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load WABA logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const jwtToken = localStorage.getItem('srijan_token') || '';
    try {
      await configureWhatsApp(tenantSlug, jwtToken, {
        phoneNumberId: phoneId,
        accessToken: token,
        isEnabled: true,
      });
      setStatusMsg('✅ Encrypted WhatsApp credentials saved successfully!');
    } catch (err: any) {
      alert('Failed to save config');
    }
  };

  const handleSendTest = async () => {
    const jwtToken = localStorage.getItem('srijan_token') || '';
    try {
      const res = await fetchFromApi('/messaging/whatsapp/send-test', {
        method: 'POST',
        tenantSlug,
        token: jwtToken,
        body: JSON.stringify({ phone: testPhone, template: 'order_confirmation' }),
      });
      setStatusMsg(`🚀 Test message triggered to ${res.recipient}! Status: ${res.status}`);
      loadLogs();
    } catch (err: any) {
      alert('Failed to send test message');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-emerald-400" />
              <span>WhatsApp Business Automation (WABA Engine)</span>
            </h1>
            <p className="text-xs text-gray-400">Automated 2-hour cart recovery, dispatch updates, and delivery alerts</p>
          </div>
        </div>

        {statusMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-xl text-xs text-emerald-400 font-semibold">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Credentials Config */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Per-Tenant WABA Credentials</span>
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Meta Phone Number ID</label>
                <input type="text" value={phoneId} onChange={(e) => setPhoneId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Permanent Access Token (AES-256 Encrypted)</label>
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white" />
              </div>
              <button type="submit" className="gradient-btn px-4 py-2.5 text-xs font-bold uppercase tracking-wider w-full">
                Save WABA Credentials
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white">Send Instant Test Message</h4>
              <div className="flex space-x-2">
                <input type="tel" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-white" />
                <button onClick={handleSendTest} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-xs font-bold text-white flex items-center space-x-1">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Logs */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-white">Automated Delivery Logs</h3>
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">Loading logs...</div>
            ) : (
              <div className="overflow-y-auto max-h-[350px] space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{log.template_name}</div>
                      <div className="text-[10px] text-gray-400">To: {log.phone_number}</div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
