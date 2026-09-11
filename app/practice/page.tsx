'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FRAMEWORKS } from '@/lib/frameworks';
import { analyzeTranscript, FILLER_WORDS, type AnalysisResult } from '@/lib/analysis';

const FREE_DAILY = 5;

function highlightFillers(text: string): ReactNode[] {
  const re = new RegExp('(' + FILLER_WORDS.join('|') + ')', 'g');
  const parts = text.split(re);
  return parts.map((p, i) =>
    FILLER_WORDS.includes(p) ? (
      <mark key={i} className="filler-mark">{p}</mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PracticePage() {
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

  const recRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const finalRef = useRef('');
  const interimRef = useRef('');

  const framework = useMemo(() => FRAMEWORKS.find((f) => f.id === frameworkId)!, [frameworkId]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const used = parseInt(localStorage.getItem('hb_quota_' + today) || '0', 10);
    setQuota(Math.max(0, FREE_DAILY - used));
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const requestAi = useCallback(
    async (text: string) => {
      setAiLoading(true);
      setAiError('');
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: text,
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
    (text: string, dur: number) => {
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
      // 消耗免费额度
      const today = new Date().toISOString().slice(0, 10);
      const key = 'hb_quota_' + today;
      const used = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(used + 1));
      setQuota(Math.max(0, FREE_DAILY - (used + 1)));
      requestAi(trimmed);
    },
    [requestAi],
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
      // 若仍处于录音状态则自动重启，保证连续识别
      if (recRef.current === rec) {
        try { rec.start(); } catch { /* ignore */ }
      }
    };

    try {
      rec.start();
    } catch {
      setNotice('麦克风启动失败，请检查权限后重试。');
      return;
    }
    recRef.current = rec;
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setDurationSec(Math.round((Date.now() - startRef.current) / 1000));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (recRef.current) {
      const r = recRef.current;
      recRef.current = null;
      try { r.stop(); } catch { /* ignore */ }
    }
    setIsRecording(false);
    clearTimer();
    const dur = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
    setDurationSec(dur);
    const text = (finalRef.current + interimRef.current).trim();
    finalize(text, dur);
  }, [finalize]);

  const analyzeTyped = () => {
    if (!typedText.trim()) {
      setNotice('请先粘贴或输入一段汇报文字。');
      return;
    }
    // 文字模式：按默认 200 字/分钟估算时长
    const charCount = typedText.replace(/\s+/g, '').length;
    const dur = Math.max(20, Math.round((charCount / 200) * 60));
    setDurationSec(dur);
    finalize(typedText, dur);
  };

  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 26, margin: '0 0 4px' }}>汇报排练</h1>
      <p style={{ color: 'var(--muted)', margin: '0 0 24px' }}>
        选一个框架，对着麦克风把这次要说的汇报练一遍。
        {quota > 0 ? ` 今日剩余免费次数：${quota} / ${FREE_DAILY}` : ' 今日免费次数已用完，明天再来练。'}
      </p>

      {/* 框架选择 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {FRAMEWORKS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFrameworkId(f.id)}
            className={f.id === frameworkId ? 'chip chip-on' : 'chip'}
            type="button"
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* 左：练习区 */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🎙️ 开始练</h3>
          <p className="muted">{framework.desc}</p>

          <div className="framework-box">
            {framework.steps.map((s) => (
              <div key={s.key} className="framework-step">
                <strong>{s.label}</strong>
                <span>{s.hint}</span>
              </div>
            ))}
          </div>

          <div className="rec-actions">
            {!isRecording ? (
              <button className="btn btn-primary" onClick={start} disabled={quota === 0}>
                {quota === 0 ? '今日额度已用完' : '开始录音'}
              </button>
            ) : (
              <button className="btn btn-stop" onClick={stop}>结束并分析</button>
            )}
            <span className="muted">{isRecording ? `已录音 ${fmt(durationSec)}` : '点击后请允许麦克风权限'}</span>
          </div>

          {notice && <p className="notice">{notice}</p>}

          <div className="transcript-box">
            <div className="transcript-label">
              <span>实时转写</span>
              {isRecording && <span className="live-dot">● 录音中</span>}
            </div>
            <p className="transcript">
              {finalText ? highlightFillers(finalText) : '（开始录音后，你说的话会出现在这里）'}
              {interim ? <em className="interim">{highlightFillers(interim)}</em> : null}
            </p>
          </div>

          <div className="divider" />

          <h4 style={{ margin: '0 0 8px' }}>没有麦克风？直接粘贴文字</h4>
          <textarea
            className="type-box"
            rows={4}
            placeholder="把你要汇报 / 要演讲的稿子粘贴到这里，点下面按钮分析（语速按 200 字/分钟估算）"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
          />
          <button className="btn btn-ghost" onClick={analyzeTyped} style={{ marginTop: 10 }}>
            分析这段文字
          </button>
        </div>

        {/* 右：结果区 */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>📊 分析结果</h3>
          {!result ? (
            <p className="muted">录音并点击「结束并分析」后，这里会显示填充词统计、语速和结构反馈。</p>
          ) : (
            <>
              <div className="score-row">
                <div className="score-big">{result.localScore}</div>
                <div>
                  <div className="muted">本地启发式得分（满分 100）</div>
                  <div className="muted small">字数 {result.charCount} · 时长 {fmt(result.durationSec)} · 语速 {result.charsPerMin} 字/分</div>
                </div>
              </div>

              <div className="stat-grid">
                <div className="stat">
                  <div className="stat-num">{result.fillerTotal}</div>
                  <div className="stat-label">填充词</div>
                </div>
                <div className="stat">
                  <div className="stat-num">{result.fillerRatio}</div>
                  <div className="stat-label">每100字</div>
                </div>
              </div>

              {result.fillers.length > 0 && (
                <div className="filler-chips">
                  {result.fillers.map((f) => (
                    <span key={f.word} className="filler-chip">{f.word} ×{f.count}</span>
                  ))}
                </div>
              )}

              <ul className="result-notes">
                <li>{result.pacingNote}</li>
                {result.structureNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>

              <div className="divider" />

              <h4 style={{ margin: '0 0 8px' }}>🤖 AI 教练点评</h4>
              {aiLoading ? (
                <p className="muted">AI 正在点评……</p>
              ) : aiError ? (
                <p className="notice">{aiError}</p>
              ) : aiFeedback ? (
                <p className="ai-feedback">{aiFeedback}</p>
              ) : (
                <p className="muted">（点评内容在此显示）</p>
              )}
            </>
          )}
        </div>
      </div>

      {!supported && (
        <p className="notice" style={{ marginTop: 16 }}>
          你的浏览器不支持语音识别，请用 Chrome / Edge 打开，或使用下方「粘贴文字」功能。
        </p>
      )}
    </main>
  );
}
