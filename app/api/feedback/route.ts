import { NextRequest, NextResponse } from 'next/server';
import { buildFeedbackPrompt } from '@/lib/analysis';
import { resolveUserByToken } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript = String(body?.transcript || '');
    const scenarioLabel = String(body?.scenarioLabel || '工作汇报');
    const frameworkName = String(body?.frameworkName || '');
    const frameworkSteps = Array.isArray(body?.frameworkSteps) ? body.frameworkSteps.map(String) : [];

    if (!transcript.trim()) {
      return NextResponse.json({ error: '没有可分析的内容，请先录音或输入文字。' }, { status: 400 });
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const { plan } = await resolveUserByToken(token);
    if (plan !== 'pro') {
      return NextResponse.json({ upgrade: true, message: 'AI 深度点评是 Pro 会员功能，登录并升级后可用。' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ note: 'AI 服务尚未配置（DEEPSEEK_API_KEY），请稍后再试。' });
    }

    const prompt = buildFeedbackPrompt(transcript, scenarioLabel, frameworkName, frameworkSteps);
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 600 }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return NextResponse.json({ error: `AI 服务调用失败（HTTP ${resp.status}）` }, { status: 502 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return NextResponse.json({ feedback: content });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '服务器错误：' + msg }, { status: 500 });
  }
}
