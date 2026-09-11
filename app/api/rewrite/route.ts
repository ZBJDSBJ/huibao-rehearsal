import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scenarioLabel = String(body?.scenarioLabel || '工作汇报');
    const frameworkName = String(body?.frameworkName || '');
    const frameworkSteps = Array.isArray(body?.frameworkSteps) ? body.frameworkSteps.map(String) : [];
    const notes = String(body?.notes || '');

    if (!notes.trim()) {
      return NextResponse.json({ error: '请先输入你的要点/素材（做了什么、结果如何等）。' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        note: '尚未配置 AI Key，无法生成汇报稿。请配置 DEEPSEEK_API_KEY 后再试（你也可以先在「练口语」里手动练习）。',
      });
    }

    const prompt = [
      '你是一位资深职场汇报写作教练，请帮我把下面这段零散要点，改写成一段可以直接照着说的汇报稿。',
      `场景：${scenarioLabel}；要求套用表达框架：${frameworkName}（${frameworkSteps.join(' → ')}）。`,
      '要求：',
      '1) 口语化、自然、不啰嗦，250～400 字；',
      '2) 严格按框架的结构顺序组织，结论先行；',
      '3) 把模糊表述改成确定、量化的表述（尽量补上可量化的结果）；',
      '4) 在关键处用【】标出这对应框架的哪一步；',
      '5) 最后另起一行，给一句 30 字以内的「上台提醒」。',
      '直接输出汇报稿正文，不要寒暄。',
      '---- 我的要点 ----',
      notes,
    ].join('\n');

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 900,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return NextResponse.json(
        { error: `AI 服务调用失败（HTTP ${resp.status}）${errText ? '：' + errText.slice(0, 200) : ''}` },
        { status: 502 },
      );
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return NextResponse.json({ draft: content });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: '服务器错误：' + msg }, { status: 500 });
  }
}
