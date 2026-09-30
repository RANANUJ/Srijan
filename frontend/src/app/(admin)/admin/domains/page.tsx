'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFromApi } from '@/lib/api';
import { Globe, Plus, CheckCircle2, Copy, ShieldCheck, RefreshCw } from 'lucide-react';

export default function DomainsManagerPage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') || 'aura-beauty';

  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [addResult, setAddResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadDomains();
  }, [tenantSlug]);

  async function loadDomains() {
    setLoading(true);
    const token = localStorage.getItem('srijan_token') || '';
    try {
      const data = await fetchFromApi('/tenant/domains', { tenantSlug, token });
      setDomains(data);
    } catch (err) {
      console.error('Failed to load domains:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    const token = localStorage.getItem('srijan_token') || '';

    try {
      const res = await fetchFromApi('/tenant/domains', {
        method: 'POST',
        tenantSlug,
        token,
        body: JSON.stringify({ domain: newDomain }),
      });
      setAddResult(res);
      setNewDomain('');
      loadDomains();
    } catch (err: any) {
      alert(err.message || 'Failed to add custom domain');
    }
  };

  const handleVerify = async (domainName: string) => {
    setVerifying(true);
    const token = localStorage.getItem('srijan_token') || '';

    try {
      const res = await fetchFromApi('/tenant/domains/verify', {
        method: 'POST',
        tenantSlug,
        token,
        body: JSON.stringify({ domain: domainName }),
      });
      alert(`🎉 Domain ${res.domain} verified and SSL activated! Your store is live on this custom domain.`);
      loadDomains();
    } catch (err: any) {
      alert(err.message || 'DNS Verification failed. Please check TXT records.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white flex items-center space-x-2">
              <Globe className="w-6 h-6 text-purple-400" />
              <span>Custom Domain & SSL Manager</span>
            </h1>
            <p className="text-xs text-gray-400">Map custom brand domains (e.g. www.aurabeauty.in) with zero platform branding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Domain Form */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Connect New Domain</span>
            </h3>

            <form onSubmit={handleAddDomain} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Custom Domain Name</label>
                <input
                  type="text"
                  required
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. www.aurabeauty.in or store.brand.com"
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white"
                />
              </div>

              <button type="submit" className="gradient-btn py-2.5 text-xs font-bold uppercase tracking-wider w-full">
                Add Domain
              </button>
            </form>

            {addResult && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-white">DNS Instructions for {addResult.domain}:</p>
                <div className="bg-black/40 p-2.5 rounded font-mono text-[11px] text-purple-300 select-all">
                  {addResult.instructions}
                </div>
              </div>
            )}
          </div>

          {/* Active Domains List */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-white">Registered Brand Domains</h3>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">Loading domains...</div>
            ) : (
              <div className="space-y-3">
                {domains.map((d) => (
                  <div key={d.id} className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{d.domain}</span>
                        {d.is_primary && <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded">Primary</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">SSL Status: <span className="text-emerald-400 font-bold">{d.ssl_status}</span></div>
                    </div>

                    <div>
                      {d.ssl_status === 'ACTIVE' ? (
                        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-bold text-[10px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified & Live</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerify(d.domain)}
                          disabled={verifying}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center space-x-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
                          <span>Verify DNS</span>
                        </button>
                      )}
                    </div>
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
