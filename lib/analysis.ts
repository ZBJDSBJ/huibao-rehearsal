export interface Dimension {
  key: string;
  label: string;
  score: number; // 0-100
  note: string;
}

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
  dimensions: Dimension[];
}

// 按长度降序，便于正则优先匹配长词（如"就是就是"优先于"就是"）
export const FILLER_WORDS = [
  '怎么说呢', '就是就是', '然后然后', '你知道吗', '的话', '那么', '那个', '这个',
  '就是', '然后', '其实', '反正', '对吧', '是吧', '嗯', '呃', '啊',
].sort((a, b) => b.length - a.length);

const VAGUE_WORDS = ['我觉得', '可能', '大概', '也许', '差不多', '应该', '好像', '似乎', '挺', '比较'];
const STRUCTURE_MARKERS = ['首先', '其次', '然后', '最后', '第一', '第二', '第三', '结论', '因为', '所以', '总结', '总之', '综上', '一方面', '另一方面', '首先说', '结果'];

function countMatches(text: string, words: string[]): number {
  let n = 0;
  for (const w of words) {
    n += (text.match(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  }
  return n;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

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

  // 语速
  let pacingNote = '';
  if (charCount === 0) pacingNote = '还没检测到有效内容，请先开口说几句。';
  else if (cpm === 0) pacingNote = '语速数据不足（录音太短），建议说满 20 秒以上。';
  else if (cpm < 160) pacingNote = `语速约 ${cpm} 字/分钟，偏慢——汇报容易显得拖沓，可适当提速。`;
  else if (cpm > 280) pacingNote = `语速约 ${cpm} 字/分钟，偏快——听众可能跟不上，关键结论处要停顿。`;
  else pacingNote = `语速约 ${cpm} 字/分钟，节奏适中。`;

  // 结构
  const structureNotes: string[] = [];
  const markerCount = countMatches(text, STRUCTURE_MARKERS);
  const vagueCount = countMatches(text, VAGUE_WORDS);
  if (charCount === 0) {
    structureNotes.push('内容是空的，无法分析。');
  } else {
    if (charCount < 60) structureNotes.push('内容偏短（<60 字），还不足以支撑一次完整汇报，试着把「结论→理由→例证」说全。');
    else if (markerCount === 0) structureNotes.push('没听到明显的逻辑连接词（首先/其次/结论/因为/所以…），结构可能偏散，建议用框架串起来。');
    else structureNotes.push(`检测到 ${markerCount} 处逻辑连接词，结构有骨架。`);

    if (fillerTotal > 0) {
      structureNotes.push(`检测到 ${fillerTotal} 处填充词（${fillers.map((f) => f.word).slice(0, 5).join('、')}${fillers.length > 5 ? ' 等' : ''}），可用停顿代替。`);
    } else {
      structureNotes.push('未检测到明显填充词，表达很干净。');
    }
    if (vagueCount > 0) structureNotes.push(`有 ${vagueCount} 处模糊词（我觉得/可能/大概…），汇报里尽量换成确定、量化的表述。`);
  }

  // 多维评分（雷达图）
  const structureScore = charCount === 0 ? 0 : clamp(50 + (charCount >= 80 ? 20 : 0) + (markerCount > 0 ? 15 : 0) + (markerCount >= 3 ? 10 : 0) - (charCount < 60 ? 20 : 0));
  const fluencyScore = clamp(85 - fillerTotal * 3 - (fillerRatio > 5 ? 10 : 0) + (fillerTotal === 0 ? 5 : 0));
  const uniqueRatio = charCount > 0 ? new Set(cleaned).size / charCount : 0;
  const vocabularyScore = clamp(60 + (uniqueRatio > 0.5 ? 12 : 0) + (charCount > 100 ? 8 : 0) - (vagueCount > 0 ? 12 : 0));
  const pacingScore = clamp(cpm === 0 ? 40 : (cpm >= 160 && cpm <= 280 ? 80 : 50) + (durationSec >= 30 ? 10 : 0));

  const dimensions: Dimension[] = [
    { key: 'structure', label: '结构逻辑', score: structureScore, note: structureScore >= 70 ? '结构清晰' : structureScore >= 50 ? '结构一般，可再补连接词' : '结构偏散，建议套框架' },
    { key: 'fluency', label: '表达流畅', score: fluencyScore, note: fillerTotal === 0 ? '无填充词，很流畅' : `填充词 ${fillerTotal} 处` },
    { key: 'vocabulary', label: '词汇精准', score: vocabularyScore, note: vagueCount > 0 ? `模糊词 ${vagueCount} 处` : '用词较精准' },
    { key: 'pacing', label: '语速节奏', score: pacingScore, note: cpm > 0 ? `${cpm} 字/分` : '数据不足' },
  ];

  // 总分 = 四维平均
  const localScore = clamp(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

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
    localScore,
    summary,
    dimensions,
  };
}

export function buildFeedbackPrompt(
  transcript: string,
  scenarioLabel: string,
  frameworkName: string,
  frameworkSteps: string[],
): string {
  return [
    '你是一位资深职场沟通教练，请用中文点评下面这段汇报 / 表达练习。',
    `练习场景：${scenarioLabel}；使用的表达框架：${frameworkName}（${frameworkSteps.join(' → ')}）。`,
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
