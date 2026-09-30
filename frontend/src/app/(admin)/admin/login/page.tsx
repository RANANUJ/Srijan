'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [tenantSlug, setTenantSlug] = useState('aura-beauty');
  const [email, setEmail] = useState('owner@aurabeauty.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminLogin(tenantSlug, { email, password });
      localStorage.setItem('srijan_token', res.access_token);
      localStorage.setItem('srijan_user', JSON.stringify(res.user));
      localStorage.setItem('srijan_tenant_slug', tenantSlug);
      router.push(`/admin/dashboard?tenant=${tenantSlug}`);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center mx-auto text-white font-bold text-xl shadow-lg">
            S
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Brand Admin Login</h1>
          <p className="text-xs text-gray-400">Isolated Brand Administrative Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Tenant Slug</label>
            <select
              value={tenantSlug}
              onChange={(e) => {
                setTenantSlug(e.target.value);
                if (e.target.value === 'aura-beauty') setEmail('owner@aurabeauty.com');
                if (e.target.value === 'veda-organics') setEmail('admin@vedaorganics.com');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
            >
              <option value="aura-beauty">aura-beauty (Aura Beauty)</option>
              <option value="veda-organics">veda-organics (Veda Organics)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Staff Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
            />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center text-xs text-gray-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tenant Context Encrypted • Zero Data Leakage</span>
        </div>
      </div>
    </div>
  );
}
