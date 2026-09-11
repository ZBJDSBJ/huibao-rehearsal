export interface FrameworkStep {
  key: string;
  label: string;
  hint: string;
}

export interface Framework {
  id: string;
  name: string;
  desc: string;
  steps: FrameworkStep[];
}

export const FRAMEWORKS: Framework[] = [
  {
    id: 'star',
    name: 'STAR 法则',
    desc: '讲项目、讲经历、讲成果最常用的结构化方法',
    steps: [
      { key: 's', label: 'S · 情境 Situation', hint: '当时是什么背景、要解决什么问题' },
      { key: 't', label: 'T · 任务 Task', hint: '你承担的任务 / 目标是什么' },
      { key: 'a', label: 'A · 行动 Action', hint: '你具体做了什么、怎么做的' },
      { key: 'r', label: 'R · 结果 Result', hint: '结果如何，尽量给出量化数据' },
    ],
  },
  {
    id: 'prep',
    name: 'PREP 表达法',
    desc: '快速陈述观点、让结论先行的通用框架',
    steps: [
      { key: 'p', label: 'P · 观点 Point', hint: '第一句就亮结论 / 观点' },
      { key: 'r', label: 'R · 理由 Reason', hint: '为什么：给出 1-2 条理由' },
      { key: 'e', label: 'E · 例证 Example', hint: '用例子 / 数据支撑' },
      { key: 'p2', label: 'P · 重申 Point', hint: '回到观点，一句话收束' },
    ],
  },
  {
    id: 'pyramid',
    name: '金字塔原理',
    desc: '麦肯锡式：结论先行、以上统下、归类分组',
    steps: [
      { key: 'c', label: '结论先行', hint: '第一句话就说结论，别铺垫' },
      { key: 'g', label: '归类分组', hint: '支撑结论的要点按 MECE 分组' },
      { key: 'o', label: '逻辑递进', hint: '每组要点按时间 / 结构 / 程度排序' },
    ],
  },
];
