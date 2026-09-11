import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const admin = getAdminClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: 'Stripe 未配置' }, { status: 500 });

  const sig = req.headers.get('stripe-signature') || '';
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: '签名校验失败' }, { status: 400 });
  }

  if (admin) {
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        const userId = session.client_reference_id || session.subscription?.metadata?.user_id || session.metadata?.user_id;
        if (userId) {
          await admin.from('profiles').update({
            plan: 'pro',
            stripe_customer_id: session.customer,
            stripe_subscription_id: subId,
          }).eq('id', userId);
        }
      } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const sub = event.data.object as any;
        const shouldDowngrade = event.type === 'customer.subscription.deleted' || sub.status === 'canceled' || sub.status === 'unpaid';
        if (shouldDowngrade && sub.id) {
          const { data } = await admin.from('profiles').select('id').eq('stripe_subscription_id', sub.id).single();
          if (data) await admin.from('profiles').update({ plan: 'free' }).eq('id', data.id);
        }
      }
    } catch { /* 幂等处理：重复事件忽略即可 */ }
  }

  return NextResponse.json({ received: true });
}
