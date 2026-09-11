export interface AnalysisResult {
  charCount: number;
  durationSec: number;
  charsPerMin: number;
  fillers: { word: string; count: number }[];
  fillerTotal: number;
  fillerRatio: number; // 每 100 字出现的填充词个数
  pacingNote: string;
  structureNotes: string[];
  localScore: number; // 0-100 本地启发式打分
  summary: string;
}

// 按长度降序，便于正则优先匹配长词（如"就是就是"优先于"就是"）
export const FILLER_WORDS = [
  '怎么说呢', '就是就是', '然后然后', '你知道吗', '的话', '那么', '那个', '这个',
  '就是', '然后', '其实', '反正', '对吧', '是吧', '嗯', '呃', '啊',
].sort((a, b) => b.length - a.length);

export function analyzeTranscript(text: string, durationSec: number): AnalysisResult {
  const cleaned = text.replace(/\s+/g, '');
  const charCount = cleaned.length;
  const cpm = durationSec > 0 ? Math.round((charCount / durationSec) * 60) : 0;

  const fillers = FILLER_WORDS
    .map((word) => ({ word, count: (text.match(new RegExp(word, 'g')) || []).length }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
  const fillerTotal = fillers.reduce((s, f) => s + f.count, 0);
  const fillerRatio = charCount > 0 ? +(fillerTotal / (charCount / 100)).toFixed(1) : 0;

  let pacingNote = '';
  if (charCount === 0) pacingNote = '还没检测到有效内容，请先开口说几句。';
  else if (cpm === 0) pacingNote = '语速数据不足（可能录音太短），建议说满 20 秒以上。';
  else if (cpm < 160) pacingNote = `语速约 ${cpm} 字/分钟，偏慢——汇报容易显得拖沓，可适当提速。`;
  else if (cpm > 280) pacingNote = `语速约 ${cpm} 字/分钟，偏快——听众可能跟不上，关键结论处要停顿。`;
  else pacingNote = `语速约 ${cpm} 字/分钟，节奏适中。`;

  const structureNotes: string[] = [];
  if (charCount === 0) {
    structureNotes.push('内容是空的，无法分析。');
  } else {
    if (charCount < 60) structureNotes.push('内容偏短（<60 字），还不足以支撑一次完整汇报，试着把「结论→理由→例证」说全。');
    if (fillerTotal > 0) {
      structureNotes.push(`检测到 ${fillerTotal} 处填充词（${fillers.map((f) => f.word).slice(0, 5).join('、')}${fillers.length > 5 ? ' 等' : ''}），可用停顿代替。`);
    } else {
      structureNotes.push('未检测到明显填充词，表达很干净。');
    }
  }

  let score = 60;
  if (fillerTotal === 0) score += 10;
  else if (fillerRatio < 3) score += 5;
  else score -= 10;
  if (cpm >= 160 && cpm <= 280 && cpm > 0) score += 10;
  else if (cpm > 0) score -= 5;
  if (charCount >= 80 && charCount <= 600) score += 10;
  else if (charCount >= 60) score += 5;
  else if (charCount > 0) score -= 5;
  if (fillerTotal === 0 && cpm >= 160 && cpm <= 280 && charCount >= 60) score += 10;
  score = Math.max(0, Math.min(100, score));

  const summary = [pacingNote, ...structureNotes].filter(Boolean).join(' ');

  return {
    charCount,
    durationSec,
    charsPerMin: cpm,
    fillers,
    fillerTotal,
    fillerRatio,
    pacingNote,
    structureNotes,
    localScore: score,
    summary,
  };
}

export function buildFeedbackPrompt(
  transcript: string,
  frameworkName: string,
  frameworkSteps: string[],
): string {
  return [
    '你是一位资深职场沟通教练，请用中文点评下面这段工作汇报 / 表达练习。',
    `用户使用的表达框架：${frameworkName}（${frameworkSteps.join(' → ')}）。`,
    '请从四个角度简短点评，总字数 180 字以内：',
    '1) 结构：是否结论先行、逻辑清晰，对照框架缺了哪一步；',
    '2) 用词：是否啰嗦、含糊，有哪些可以更精准；',
    '3) 表达：填充词、语速、语气问题；',
    '4) 给一条最优先的、具体可执行的改进建议。',
    '用要点形式输出，语气鼓励但不敷衍。',
    '---- 用户原文 ----',
    transcript || '（空）',
  ].join('\n');
}
