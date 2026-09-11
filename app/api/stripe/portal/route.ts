import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getAdminClient, resolveUserByToken } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const admin = getAdminClient();
    if (!stripe || !admin) return NextResponse.json({ error: '支付未配置' }, { status: 500 });

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const { userId, authenticated } = await resolveUserByToken(token);
    if (!authenticated || !userId) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', userId).single();
    if (!profile?.stripe_customer_id) return NextResponse.json({ error: '暂无可管理的订阅' }, { status: 400 });

    const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${base}/practice`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '打开管理页失败：' + msg }, { status: 500 });
  }
}
