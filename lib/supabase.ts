import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return adminClient;
}

export interface Profile {
  id: string;
  email: string | null;
  plan: 'free' | 'pro';
  daily_count: number;
  usage_date: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const c = getAdminClient();
  if (!c) return null;
  const { data } = await c.from('profiles').select('*').eq('id', userId).single();
  return (data as Profile) || null;
}

// 校验并扣除一次免费额度；返回是否允许本次练习
export async function consumeQuota(userId: string, dailyLimit: number): Promise<{ allowed: boolean; remaining: number }> {
  const c = getAdminClient();
  if (!c) return { allowed: true, remaining: dailyLimit };
  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await c.from('profiles').select('*').eq('id', userId).single();
  if (!profile) return { allowed: false, remaining: 0 };

  const isNewDay = profile.usage_date !== today;
  const count = isNewDay ? 0 : (profile.daily_count || 0);

  if (profile.plan !== 'pro' && count >= dailyLimit) {
    return { allowed: false, remaining: 0 };
  }

  await c.from('profiles').update({ daily_count: count + 1, usage_date: today }).eq('id', userId);
  const remaining = profile.plan === 'pro' ? 9999 : Math.max(0, dailyLimit - (count + 1));
  return { allowed: true, remaining };
}

// 根据前端传来的 access token 识别用户与套餐
export async function resolveUserByToken(token: string): Promise<{ userId: string | null; plan: 'free' | 'pro'; authenticated: boolean }> {
  const admin = getAdminClient();
  if (!admin || !token) return { userId: null, plan: 'free', authenticated: false };
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return { userId: null, plan: 'free', authenticated: false };
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single();
  const plan = profile?.plan === 'pro' ? 'pro' : 'free';
  return { userId: user.id, plan, authenticated: true };
}
