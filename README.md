# 汇报排练 · 表达训练（网页版 AI 汇报教练）

对着浏览器麦克风练工作汇报、述职、面试：实时转写、标出填充词、套用 STAR / PREP / 金字塔框架，AI 教练帮你把话说清楚。**无需下载，打开即用。**

## 技术栈

- Next.js 15（App Router）+ React 19 + TypeScript
- 语音识别：浏览器 Web Speech API（Chrome / Edge，中文 zh-CN，免费）
- AI 点评：可选 DeepSeek API（不配 Key 也能用，仅无深度点评）
- 部署：Vercel（免费额度即可起步）

## 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
```

## 构建 / 生产

```bash
npm run build
npm start
```

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
DEEPSEEK_API_KEY=   # 可选，填入后启用 AI 深度点评
```

## 目录结构

```
app/
  app/
    page.tsx              # SEO 落地页（服务端组件）
    practice/page.tsx     # 汇报排练工具（客户端组件）
    api/feedback/route.ts # AI 点评代理接口（隐藏 Key）
  lib/
    frameworks.ts         # STAR / PREP / 金字塔框架定义
    analysis.ts           # 填充词检测 / 语速 / 本地启发式打分
```

## 上线

见 `DEPLOY.md`。支付（Stripe）为 v2，需先注册 Stripe + 人工复核支付代码。
