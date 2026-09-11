'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FRAMEWORKS } from '@/lib/frameworks';
import { SCENARIOS } from '@/lib/scenarios';
import { analyzeTranscript, FILLER_WORDS, type AnalysisResult, type Dimension } from '@/lib/analysis';

const FREE_DAILY = 5;
const HISTORY_KEY = 'hb_history';

interface HistoryItem {
  ts: number;
  scenario: string;
  framework: string;
  score: number;
  chars: number;
  cpm: number;
}

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
}

function highlightFillers(text: string): ReactNode[] {
  const re = new RegExp('(' + FILLER_WORDS.join('|') + ')', 'g');
  const parts = text.split(re);
  return parts.map((p, i) =>
    FILLER_WORDS.includes(p) ? <mark key={i} className="filler-mark">{p}</mark> : <span key={i}>{p}</span>,
  );
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function RadarChart({ dimensions }: { dimensions: Dimension[] }) {
  const cx = 80, cy = 80, R = 56;
  const n = Math.max(3, dimensions.length);
  const ang = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const pt = (i: number, r: number) => ({ x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)) });
  const poly = (ratio: number) => dimensions.map((_, i) => { const p = pt(i, R * ratio); return `${p.x},${p.y}`; }).join(' ');
  const dataPoly = dimensions.map((d, i) => { const p = pt(i, R * (d.score / 100)); return `${p.x},${p.y}`; }).join(' ');

  return (
    <svg width="210" height="180" viewBox="0 0 160 160" role="img" aria-label="多维评分雷达图">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={poly(r)} fill="none" stroke="#e7e9f2" strokeWidth="1" />
      ))}
      {dimensions.map((_, i) => {
        const p = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e7e9f2" strokeWidth="1" />;
      })}
      <polygon points={dataPoly} fill="rgba(79,70,229,0.18)" stroke="#4f46e5" strokeWidth="2" />
      {dimensions.map((d, i) => {
        const p = pt(i, R * (d.score / 100));
        return <circle key={d.key} cx={p.x} cy={p.y} r="3.5" fill="#4f46e5" />;
      })}
      {dimensions.map((d, i) => {
        const lp = pt(i, R + 17);
        return (
          <text key={d.key} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fill="#5c6478" fontWeight="600">
            {d.label} {d.score}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const filled = c * (score / 100);
  return (
    <div className="gauge">
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#e7e9f2" strokeWidth="8" />
        <circle cx="46" cy="46" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="8"
          strokeDasharray={`${filled} ${c - filled}`} strokeLinecap="round" />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
      <div className="val"><b>{score}</b><span>分</span></div>
    </div>
  );
}

export default function PracticePage() {
  const [tab, setTab] = useState<'practice' | 'rewrite'>('practice');

  // 练口语 state
  const [scenarioId, setScenarioId] = useState('weekly');
  const [frameworkId, setFrameworkId] = useState('star');
  const [isRecording, setIsRecording] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interim, setInterim] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [quota, setQuota] = useState(FREE_DAILY);
  const [supported, setSupported] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 写汇报稿 state
  const [rwScenario, setRwScenario] = useState('weekly');
  const [rwFramework, setRwFramework] = useState('pyramid');
  const [rwNotes, setRwNotes] = useState('');
  const [rwResult, setRwResult] = useState('');
  const [rwLoading, setRwLoading] = useState(false);
  const [rwError, setRwError] = useState('');

  const recRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const finalRef = useRef('');
  const interimRef = useRef('');

  const framework = useMemo(() => FRAMEWORKS.find((f) => f.id === frameworkId)!, [frameworkId]);
  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId)!, [scenarioId]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const used = parseInt(localStorage.getItem('hb_quota_' + today) || '0', 10);
    setQuota(Math.max(0, FREE_DAILY - used));
    setHistory(loadHistory());
  }, []);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const requestAi = useCallback(
    async (text: string, scLabel: string) => {
      setAiLoading(true);
      setAiError('');
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: text,
            scenarioLabel: scLabel,
            frameworkName: framework.name,
            frameworkSteps: framework.steps.map((s) => s.label),
          }),
        });
        const data = await res.json();
        if (data.feedback) setAiFeedback(data.feedback);
        else if (data.note) setAiFeedback(data.note);
        else setAiError(data.error || '分析失败，请稍后重试');
      } catch {
        setAiError('网络错误，无法获取 AI 反馈');
      } finally {
        setAiLoading(false);
      }
    },
    [framework],
  );

  const finalize = useCallback(
    (text: string, dur: number, scLabel: string, fwName: string) => {
      const trimmed = text.trim();
      setFinalText(trimmed);
      setInterim('');
      if (!trimmed) {
        setNotice('这次没有录到内容，请检查麦克风权限或直接粘贴文字分析。');
        setResult(null);
        return;
      }
      setNotice('');
      const r = analyzeTranscript(trimmed, dur);
      setResult(r);

      const today = new Date().toISOString().slice(0, 10);
      const key = 'hb_quota_' + today;
      const used = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(used + 1));
      setQuota(Math.max(0, FREE_DAILY - (used + 1)));

      const item: HistoryItem = { ts: Date.now(), scenario: scLabel, framework: fwName, score: r.localScore, chars: r.charCount, cpm: r.charsPerMin };
      const next = [item, ...history].slice(0, 20);
      setHistory(next);
      saveHistory(next);

      requestAi(trimmed, scLabel);
    },
    [history, requestAi],
  );

  const start = useCallback(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      setNotice('当前浏览器不支持语音识别，请换用 Chrome / Edge，或直接在下方粘贴你的汇报文字。');
      return;
    }
    setSupported(true);
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    finalRef.current = '';
    interimRef.current = '';
    setFinalText('');
    setInterim('');
    setResult(null);
    setAiFeedback('');
    setAiError('');
    setNotice('');
    setDurationSec(0);
    startRef.current = Date.now();

    rec.onresult = (e: any) => {
      let it = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalRef.current += t;
        else it += t;
      }
      interimRef.current = it;
      setFinalText(finalRef.current);
      setInterim(it);
    };
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setNotice('麦克风权限被拒绝，请在浏览器地址栏允许麦克风访问后重试。');
      } else if (e.error !== 'no-speech') {
        setNotice('语音识别出错：' + e.error);
      }
    };
    rec.onend = () => {
      if (recRef.current === rec) { try { rec.start(); } catch { /* ignore */ } }
    };

    try { rec.start(); } catch { setNotice('麦克风启动失败，请检查权限后重试。'); return; }
    recRef.current = rec;
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setDurationSec(Math.round((Date.now() - startRef.current) / 1000));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (recRef.current) { const r = recRef.current; recRef.current = null; try { r.stop(); } catch { /* ignore */ } }
    setIsRecording(false);
    clearTimer();
    const dur = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
    setDurationSec(dur);
    const text = (finalRef.current + interimRef.current).trim();
    finalize(text, dur, scenario.label, framework.name);
  }, [finalize, scenario.label, framework.name]);

  const analyzeTyped = () => {
    if (!typedText.trim()) { setNotice('请先粘贴或输入一段汇报文字。'); return; }
    const charCount = typedText.replace(/\s+/g, '').length;
    const dur = Math.max(20, Math.round((charCount / 200) * 60));
    setDurationSec(dur);
    finalize(typedText, dur, scenario.label, framework.name);
  };

  const doRewrite = useCallback(async () => {
    if (!rwNotes.trim()) { setRwError('请先输入你的要点/素材。'); return; }
    setRwLoading(true); setRwError(''); setRwResult('');
    const sc = SCENARIOS.find((s) => s.id === rwScenario)!;
    const fw = FRAMEWORKS.find((f) => f.id === rwFramework)!;
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioLabel: sc.label, frameworkName: fw.name, frameworkSteps: fw.steps.map((s) => s.label), notes: rwNotes }),
      });
      const data = await res.json();
      if (data.draft) setRwResult(data.draft);
      else if (data.note) setRwError(data.note);
      else setRwError(data.error || '生成失败，请稍后重试');
    } catch {
      setRwError('网络错误，无法生成汇报稿');
    } finally {
      setRwLoading(false);
    }
  }, [rwNotes, rwScenario, rwFramework]);

  const goodScore = (s: number) => (s >= 70 ? 'good' : s >= 50 ? 'mid' : 'bad');

  return (
    <main className="container" style={{ paddingTop: 30, paddingBottom: 72 }}>
      <div className="practice-head">
        <div>
          <h1>汇报排练</h1>
          <p className="muted" style={{ margin: 0 }}>
            练一次，胜过在心里默念十遍。
            {quota > 0 ? ` 今日剩余免费次数：${quota} / ${FREE_DAILY}` : ' 今日免费次数已用完，明天再来练。'}
          </p>
        </div>
        <span className="quota-pill">✨ 无需注册 · 数据不上传</span>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'practice' ? 'on' : ''}`} onClick={() => setTab('practice')}>🎙️ 练口语</button>
        <button className={`tab-btn ${tab === 'rewrite' ? 'on' : ''}`} onClick={() => setTab('rewrite')}>✍️ 写汇报稿</button>
      </div>

      {tab === 'practice' ? (
        <div className="panel">
          {/* 左：练习区 */}
          <div className="card">
            <div className="scenario-row">
              {SCENARIOS.map((s) => (
                <button key={s.id} className={s.id === scenarioId ? 'chip chip-on' : 'chip'} onClick={() => setScenarioId(s.id)} type="button">
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <p className="muted small" style={{ margin: '0 0 10px' }}>当前场景：{scenario.emoji} {scenario.label} · {scenario.hint}</p>

            <div className="scenario-row" style={{ marginTop: 6 }}>
              {FRAMEWORKS.map((f) => (
                <button key={f.id} className={f.id === frameworkId ? 'chip chip-on' : 'chip'} onClick={() => setFrameworkId(f.id)} type="button">
                  {f.name}
                </button>
              ))}
            </div>

            <div className="framework-box">
              {framework.steps.map((s) => (
                <div key={s.key} className="framework-step">
                  <span className="st">{s.label}</span>
                  <span className="hi">{s.hint}</span>
                </div>
              ))}
            </div>

            <div className="rec-zone">
              <button
                className={`rec-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stop : start}
                disabled={!isRecording && quota === 0}
                type="button"
                aria-label={isRecording ? '结束并分析' : '开始录音'}
              >
                {isRecording ? '结束' : '录音'}
              </button>
              <div className="rec-timer">{isRecording ? fmt(durationSec) : '\u00A0'}</div>
              <p className="rec-hint">
                {isRecording ? '正在实时转写，说完了点「结束」' : quota === 0 ? '今日额度已用完' : '点击开始，请允许麦克风权限（推荐 Chrome/Edge）'}
              </p>
            </div>

            {notice && <p className="notice" style={{ marginTop: 10 }}>{notice}</p>}

            <div className="transcript-box">
              <div className="transcript-label">
                <span>实时转写</span>
                {isRecording && <span className="live-dot">● 录音中</span>}
              </div>
              <p className="transcript">
                {finalText ? highlightFillers(finalText) : '（开始录音后，你说的话会出现在这里，填充词会标红）'}
                {interim ? <em className="interim">{highlightFillers(interim)}</em> : null}
              </p>
            </div>

            <div className="divider" />

            <h4 style={{ margin: '0 0 8px' }}>没有麦克风？直接粘贴文字</h4>
            <textarea
              className="type-box" rows={4}
              placeholder="把你要汇报 / 要演讲的稿子粘贴到这里，点下面按钮分析（语速按 200 字/分钟估算）"
              value={typedText} onChange={(e) => setTypedText(e.target.value)}
            />
            <button className="btn btn-ghost btn-sm" onClick={analyzeTyped} style={{ marginTop: 10 }}>分析这段文字</button>
          </div>

          {/* 右：结果区 */}
          <div className="card">
            {!result ? (
              <>
                <h3 style={{ marginTop: 0 }}>📊 分析结果</h3>
                <p className="muted">录音并点击「结束」后，这里会显示四维评分雷达、填充词统计、语速和 AI 教练点评。</p>
                <div className="radar-wrap">
                  <RadarChart dimensions={[
                    { key: 'a', label: '结构逻辑', score: 0, note: '' },
                    { key: 'b', label: '表达流畅', score: 0, note: '' },
                    { key: 'c', label: '词汇精准', score: 0, note: '' },
                    { key: 'd', label: '语速节奏', score: 0, note: '' },
                  ]} />
                </div>
              </>
            ) : (
              <>
                <div className="score-hero">
                  <ScoreGauge score={result.localScore} />
                  <div className="score-meta">
                    <div className="big">{scenario.emoji} {scenario.label} · {framework.name}</div>
                    <div>字数 {result.charCount} · 时长 {fmt(result.durationSec)} · 语速 {result.charsPerMin} 字/分</div>
                    <div style={{ marginTop: 6 }}>填充词 {result.fillerTotal} 处 · 每100字 {result.fillerRatio}</div>
                  </div>
                </div>

                <div className="radar-wrap">
                  <RadarChart dimensions={result.dimensions} />
                </div>

                {result.fillers.length > 0 && (
                  <div className="filler-chips">
                    {result.fillers.map((f) => <span key={f.word} className="filler-chip">{f.word} ×{f.count}</span>)}
                  </div>
                )}

                <ul className="result-notes">
                  <li>{result.pacingNote}</li>
                  {result.structureNotes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>

                <div className="divider" />

                <h4 style={{ margin: '0 0 8px' }}>🤖 AI 教练点评</h4>
                {aiLoading ? <p className="muted">AI 正在点评……</p>
                  : aiError ? <p className="notice">{aiError}</p>
                  : aiFeedback ? <p className="ai-feedback">{aiFeedback}</p>
                  : <p className="muted">（点评内容在此显示）</p>}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="panel">
          {/* 写汇报稿 */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>✍️ AI 帮你把要点写成汇报稿</h3>
            <p className="muted small" style={{ margin: '0 0 14px' }}>把你零散的素材丢进来，AI 按框架帮你整理成一段能直接照着说的汇报。</p>

            <div className="scenario-row">
              {SCENARIOS.map((s) => (
                <button key={s.id} className={s.id === rwScenario ? 'chip chip-on' : 'chip'} onClick={() => setRwScenario(s.id)} type="button">
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <div className="scenario-row">
              {FRAMEWORKS.map((f) => (
                <button key={f.id} className={f.id === rwFramework ? 'chip chip-on' : 'chip'} onClick={() => setRwFramework(f.id)} type="button">
                  {f.name}
                </button>
              ))}
            </div>

            <textarea
              className="type-box" rows={8}
              placeholder={'例：本周上线了新功能，但转化率没涨。我做了什么、结果如何……\n把你的要点、数据、困惑都写进来，越具体越好。'}
              value={rwNotes} onChange={(e) => setRwNotes(e.target.value)}
            />
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={doRewrite} disabled={rwLoading}>
                {rwLoading ? '生成中…' : '生成汇报稿'}
              </button>
            </div>
            {rwError && <p className="notice" style={{ marginTop: 12 }}>{rwError}</p>}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>📄 生成结果</h3>
            {rwResult ? (
              <p className="rewrite-result">{rwResult}</p>
            ) : (
              <p className="muted">生成后的汇报稿会显示在这里，你可以直接照着练，也可以复制回「练口语」里再练一遍。</p>
            )}
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {tab === 'practice' && history.length > 0 && (
        <div className="card history">
          <h4 style={{ margin: '0 0 8px' }}>🕘 最近练习</h4>
          {history.slice(0, 6).map((h, i) => (
            <div className="history-item" key={h.ts + '-' + i}>
              <span className="sc">{h.scenario} · {h.framework} · {h.chars}字 · {h.cpm || '-'}字/分</span>
              <span className={`s ${goodScore(h.score)}`}>{h.score} 分</span>
            </div>
          ))}
        </div>
      )}

      {!supported && (
        <p className="notice" style={{ marginTop: 16 }}>
          你的浏览器不支持语音识别，请用 Chrome / Edge 打开，或使用「粘贴文字」功能。
        </p>
      )}
    </main>
  );
}
