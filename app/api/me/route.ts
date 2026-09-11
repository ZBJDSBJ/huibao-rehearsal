import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, resolveUserByToken } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const { userId, plan, authenticated } = await resolveUserByToken(token);
  if (!authenticated || !userId) {
    return NextResponse.json({ configured: true, authenticated: false });
  }
  const admin = getAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  let remaining = PLANS[plan].dailyLimit;
  let email: string | null = null;
  if (admin) {
    const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).single();
    email = profile?.email || null;
    const used = profile?.usage_date === today ? (profile.daily_count || 0) : 0;
    remaining = plan === 'pro' ? 9999 : Math.max(0, PLANS.free.dailyLimit - used);
  }
  return NextResponse.json({ configured: true, authenticated: true, plan, remaining, email });
}
