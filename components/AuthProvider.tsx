'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface AuthUser { email: string; }

interface AuthState {
  configured: boolean;
  loading: boolean;
  user: AuthUser | null;
  plan: 'free' | 'pro';
  remaining: number;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  goPro: (interval: 'month' | 'year') => Promise<string | null>;
  manageSub: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configured = !!(supabaseUrl && supabaseAnon);

  const client = useMemo<SupabaseClient | null>(() => {
    if (!configured || !supabaseUrl || !supabaseAnon) return null;
    return createClient(supabaseUrl, supabaseAnon);
  }, [configured, supabaseUrl, supabaseAnon]);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [remaining, setRemaining] = useState(5);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!client) { setLoading(false); return; }
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      setUser(null); setPlan('free'); setRemaining(5); setAccessToken(null); setLoading(false); return;
    }
    setUser({ email: session.user.email || '' });
    setAccessToken(session.access_token);
    try {
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const d = await res.json();
      if (d.authenticated) { setPlan(d.plan); setRemaining(d.remaining); }
    } catch { /* ignore */ }
    setLoading(false);
  }, [client]);

  useEffect(() => { refresh(); }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!client) return '账号系统未配置（请先设置 Supabase）';
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    await refresh();
    return null;
  }, [client, refresh]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!client) return '账号系统未配置（请先设置 Supabase）';
    const { error } = await client.auth.signUp({ email, password });
    if (error) return error.message;
    await refresh();
    return null;
  }, [client, refresh]);

  const signOut = useCallback(async () => {
    if (client) await client.auth.signOut();
    setUser(null); setPlan('free'); setRemaining(5); setAccessToken(null);
  }, [client]);

  const goPro = useCallback(async (interval: 'month' | 'year') => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken || ''}` },
      body: JSON.stringify({ interval }),
    });
    const d = await res.json();
    if (d.url) { window.location.href = d.url; return null; }
    return d.error || '支付未配置';
  }, [accessToken]);

  const manageSub = useCallback(async () => {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken || ''}` },
    });
    const d = await res.json();
    if (d.url) { window.location.href = d.url; return null; }
    return d.error || '无法打开管理页';
  }, [accessToken]);

  const value = useMemo<AuthState>(() => ({
    configured, loading, user, plan, remaining, accessToken, signIn, signUp, signOut, goPro, manageSub,
  }), [configured, loading, user, plan, remaining, accessToken, signIn, signUp, signOut, goPro, manageSub]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
