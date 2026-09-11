import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AuthNav from '@/components/AuthNav';

export const metadata: Metadata = {
  title: '汇报排练 · 表达训练 — 网页版 AI 汇报教练',
  description:
    '不用下载，打开网页对着麦克风练工作汇报、述职、面试：实时转写、标出填充词、套用 STAR/PREP/金字塔框架，AI 帮你把话说清楚。',
  keywords: [
    '工作汇报怎么写', '述职报告怎么准备', '演讲紧张怎么办', '面试表达训练',
    '周报怎么写', '汇报排练工具', '表达能力提升', 'AI 汇报教练',
  ],
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: '汇报排练 · 表达训练 — 网页版 AI 汇报教练',
    description: '对着浏览器麦克风练汇报，实时转写 + 填充词检测 + 表达框架 + AI 反馈，打开即用。',
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <header className="site-header">
            <div className="container header-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">🎤</span>
                <span>汇报排练</span>
              </Link>
              <nav className="nav">
                <Link href="/practice">开始练习</Link>
                <Link href="/#features">功能</Link>
                <Link href="/pricing">定价</Link>
                <Link href="/#faq">FAQ</Link>
                <AuthNav />
              </nav>
            </div>
          </header>
          {children}
          <footer className="site-footer">
            <div className="container">
              <p>汇报排练 · 表达训练 — 把每一次汇报，练成你的加分项。</p>
              <p className="foot-muted">
                <Link href="/pricing">定价</Link> · <Link href="/privacy">隐私政策</Link> · <Link href="/terms">用户协议</Link>
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
