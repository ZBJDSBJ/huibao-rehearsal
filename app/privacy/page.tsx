import type { Metadata } from 'next';

export const metadata: Metadata = { title: '隐私政策 — 汇报排练 · 表达训练' };

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 72, maxWidth: 780 }}>
      <h1>隐私政策</h1>
      <p className="muted">更新日期：2025-09-11</p>
      <div className="legal">
        <h2>1. 我们收集什么</h2>
        <p>
          - <b>语音转写</b>：你在练习时说的话，通过你浏览器自带的语音识别（Web Speech API，由浏览器厂商处理）
          实时转成文字。这段语音本身<b>不会上传到我们的服务器</b>。
        </p>
        <p>
          - <b>转写文字</b>：当你使用「AI 深度点评」或「AI 写汇报稿」时，转写文字/要点会发送到我们的服务器，
          仅用于调用 AI 生成反馈，<b>我们不会存储</b>这些内容。
        </p>
        <p>- <b>账号信息</b>：注册时你提供的邮箱；历史练习记录（本地为主，登录后云端同步）。</p>

        <h2>2. 我们如何使用</h2>
        <p>仅用于提供和优化本工具的功能（生成反馈、保存你的进度）。不会出售你的任何数据。</p>

        <h2>3. 数据存储</h2>
        <p>本地练习记录默认存储在你自己浏览器里（localStorage）。登录后，练习记录同步到我们使用的云数据库（Supabase），仅你自己可见。</p>

        <h2>4. 第三方服务</h2>
        <p>本工具可能用到：DeepSeek（AI 生成）、Stripe（支付）、Supabase（账号与存储）。它们各自遵循其隐私政策。</p>

        <h2>5. 你的权利</h2>
        <p>你可以随时删除本地记录（清除浏览器缓存）、注销账号。联系我们：见页面底部。</p>

        <p className="muted small">※ 本政策为草稿，正式上线收费前请法务/专业人士复核。</p>
      </div>
    </main>
  );
}
