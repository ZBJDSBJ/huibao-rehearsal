import type { Metadata } from 'next';
import { PLANS } from '@/lib/plans';
import PricingButton from '@/components/PricingButton';

export const metadata: Metadata = {
  title: '定价 — 汇报排练 · 表达训练',
  description: '免费版每天 5 次；Pro 会员无限练习 + AI 深度点评 + AI 写汇报稿 + 云端同步。',
};

export default function PricingPage() {
  return (
    <main style={{ paddingBottom: 72 }}>
      <div className="practice-hero">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="container">
          <div className="practice-head">
            <div>
              <h1>定价</h1>
              <p className="muted" style={{ margin: 0 }}>先用免费版练起来，需要 AI 教练时再升级。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32 }}>
        <div className="pricing-grid">
          {(['free', 'pro'] as const).map((id) => {
            const p = PLANS[id];
            return (
              <div key={id} className={`price-card ${id === 'pro' ? 'hot' : ''}`}>
                {id === 'pro' && <span className="price-badge">推荐</span>}
                <h3>{p.name}</h3>
                <p className="muted" style={{ margin: '4px 0 16px' }}>{p.tagline}</p>
                <div className="price-num">
                  {id === 'pro' ? (
                    <>
                      <b>¥{p.priceMonthly}</b><span>/月</span>
                      <div className="muted small" style={{ marginTop: 4 }}>或 ¥{p.priceYearly}/年（约 ¥{(p.priceYearly / 12).toFixed(0)}/月）</div>
                    </>
                  ) : (
                    <b>¥0</b>
                  )}
                </div>
                <ul className="price-features">
                  {p.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <div style={{ marginTop: 18 }}>
                  {id === 'pro' ? (
                    <>
                      <PricingButton interval="month" />
                      <PricingButton interval="year" />
                    </>
                  ) : (
                    <a href="/practice" className="btn btn-ghost btn-lg" style={{ width: '100%' }}>开始免费练习</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="muted small" style={{ textAlign: 'center', marginTop: 22 }}>
          订阅通过 Stripe 安全支付，可随时在账号内取消。订阅前请先登录。
        </p>
      </div>
    </main>
  );
}
