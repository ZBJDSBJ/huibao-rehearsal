import type { Metadata } from 'next';

export const metadata: Metadata = { title: '用户协议 — 汇报排练 · 表达训练' };

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 780 }}>
      <h1>用户协议</h1>
      <p className="muted">更新日期：2025-09-11</p>
      <div className="legal">
        <h2>1. 服务说明</h2>
        <p>本工具提供沟通/汇报表达能力训练与 AI 辅助反馈，仅供个人学习使用，不构成任何职业、法律或医疗建议。</p>

        <h2>2. 账号与订阅</h2>
        <p>免费版每天有练习次数限制；Pro 会员通过 Stripe 订阅，按所选周期自动续费，可随时在账号内取消。</p>

        <h2>3. 使用规范</h2>
        <p>不得利用本工具生成违法违规、侵权或有害内容；不得对服务进行反向工程或滥用 API。</p>

        <h2>4. 免责声明</h2>
        <p>AI 生成的反馈与汇报稿仅供参考，重要场合请自行审核。因使用本工具产生的任何间接损失，我们不予承担。</p>

        <h2>5. 服务变更</h2>
        <p>我们可能随时调整功能与价格，重大变更会提前通知。</p>

        <p className="muted small">※ 本协议为草稿，正式上线收费前请法务/专业人士复核。</p>
      </div>
    </main>
  );
}
