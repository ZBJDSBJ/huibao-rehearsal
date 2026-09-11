import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { resolveUserByToken } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: '支付未配置（STRIPE_SECRET_KEY）' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const interval = body?.interval === 'year' ? 'year' : 'month';
    const priceId = interval === 'year' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
    if (!priceId) return NextResponse.json({ error: '未配置价格 ID（STRIPE_PRICE_*）' }, { status: 500 });

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const { userId, authenticated } = await resolveUserByToken(token);
    if (!authenticated || !userId) return NextResponse.json({ error: '请先登录后再订阅' }, { status: 401 });

    const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/practice?upgraded=1`,
      cancel_url: `${base}/pricing`,
      client_reference_id: userId,
      subscription_data: { metadata: { user_id: userId } },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '创建支付会话失败：' + msg }, { status: 500 });
  }
}
