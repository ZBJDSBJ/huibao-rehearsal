# DEPLOY.md — 部署清单（汇报排练 · 表达训练）

> 对应 SKILL.md 阶段二 · 步骤 9。本文件是"正式上线"的人工关卡清单。
> 标 ⛔ 的步骤**必须由你亲自操作**（Pi 无法代劳：涉及你的账号、身份、付款或公开可见内容的最终点头）。

## 0. 当前状态

- MVP 已实现并本地构建通过（`npm run build` 成功，类型检查通过）
- 冒烟测试通过：`/`、`/practice` 返回 200，`/api/feedback` 无 Key 时优雅降级
- 支付**尚未接入**（v1 为免费额度版，Stripe 见下方「第三阶段」）

## 第一阶段：部署到 Vercel（免费）

1. ⛔ **注册 Vercel 账号**：访问 https://vercel.com ，用 GitHub / 邮箱注册（涉及你的账号，Pi 无法代办）。
2. 本地安装依赖并构建（已做）：
   ```bash
   cd app && npm install && npm run build
   ```
3. 部署（二选一）：
   - **方式 A（Vercel CLI）**：`npm i -g vercel` 后在本目录执行 `vercel` 登录并 `vercel --prod`
   - **方式 B（GitHub 集成）**：把 `app/` 推到一个 GitHub 仓库，在 Vercel 里 Import 该仓库，框架自动识别 Next.js
4. 环境变量（可选）：在 Vercel 项目 Settings → Environment Variables 添加 `DEEPSEEK_API_KEY`（不填也能用，仅无 AI 深度点评）。

## 第二阶段：域名与监控

1. ⛔ **购买域名**（实际付款，Pi 无法代办）：推荐 Namecheap / 阿里云 / 腾讯云，`.com` 约 ¥50-80/年，`.cn` 约 ¥30/年。
2. ⛔ **配置自定义域名 + HTTPS**：在 Vercel 项目 → Settings → Domains 添加域名，按提示到域名商处添加 DNS 记录（A/CNAME）；HTTPS 由 Vercel 自动签发。
3. 错误监控：Vercel 项目 → Analytics 开启（有免费额度），或用 Sentry（`@sentry/nextjs`）——这一步写代码即可，Pi 可代劳，待你确认接入。

## 第三阶段：接入 Stripe 订阅（v2，两处人工关卡）

> 这是 website 载体 `humanGates` 明确列出的关卡，**先做免费版跑起来，再按下面顺序接支付**。

1. ⛔ **注册 Stripe 账号 + 绑定银行卡**（涉及身份与收款账户，Pi 无法代办）：
   - 访问 https://stripe.com 注册，绑定你的收款银行卡（个人可用，按国家/地区要求可能需提交身份信息）
   - 在 Stripe Dashboard 建一个「Product + Price」（如：月度会员 ¥29、年度会员 ¥199）
   - 拿到 `STRIPE_SECRET_KEY`（测试模式 `sk_test_...` 先跑通，再切 `sk_live_...`）

2. **写支付代码**（Pi 可代劳，但见第 3 点）：Checkout Session 创建路由 + Webhook 路由 + 用量额度字段。

3. ⛔ **支付相关代码上线前必须人工复核**（不能仅凭 Pi 自证正确），重点检查：
   - [ ] Webhook 签名校验是否用 `stripe.webhooks.constructEvent` 且使用正确的 endpoint secret
   - [ ] 金额是否**只以 Stripe 服务端返回为准**，绝不由前端传入
   - [ ] 幂等处理：同一 `checkout.session.completed` 事件重复推送时，不会重复发放额度
   - [ ] 测试模式（`sk_test`）完整走通"订阅→Webhook→额度到账→续费/取消"全流程后，再切生产

4. ⛔ **配置 Webhook 生产地址**：Vercel 上线后，把 `https://你的域名/api/stripe/webhook` 填进 Stripe Dashboard → Webhooks，并填入正确的 endpoint secret 到 Vercel 环境变量。

## 第四阶段：正式发布前最终确认（⛔ 人工关卡）

上线前请人工过一遍：
- [ ] 首页 / 练习页在手机和电脑都能正常打开
- [ ] 麦克风录音、填充词标红、框架切换、AI 点评（若配了 Key）均可用
- [ ] 隐私说明：本工具在浏览器端处理语音（Web Speech API 走浏览器厂商服务），未上传服务器存储——确认这与你预期的隐私承诺一致后再公开
- [ ] 域名可访问、HTTPS 正常

以上全部确认后，回复我「发布」，我再把公开内容做最后一遍检查并给出首发渠道建议（Product Hunt / V2EX / 少数派 / 即刻 等）。

## 冒烟测试清单（已执行）

| 项 | 结果 |
|---|---|
| `npm run build` | ✅ 通过 |
| `GET /` 返回 200 + 正确 title | ✅ |
| `GET /practice` 返回 200 | ✅ |
| `POST /api/feedback` 无 Key 时优雅降级 | ✅ 返回提示 note |
