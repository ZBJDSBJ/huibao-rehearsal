export interface Scenario {
  id: string;
  label: string;
  emoji: string;
  hint: string;
}

export const SCENARIOS: Scenario[] = [
  { id: 'weekly', label: '周报汇报', emoji: '📋', hint: '向领导汇报本周进展与结果' },
  { id: 'project', label: '项目汇报', emoji: '📊', hint: '汇报项目进度、风险与下一步' },
  { id: 'shuzhi', label: '述职汇报', emoji: '📈', hint: '转正 / 晋升 / 年终述职' },
  { id: 'interview', label: '面试', emoji: '💼', hint: '自我介绍、项目经历、行为面试' },
  { id: 'dabian', label: '答辩', emoji: '🎓', hint: '晋升答辩 / 毕业答辩' },
  { id: 'pitch', label: '路演 / 宣讲', emoji: '🚀', hint: '产品 / 方案 / 计划宣讲' },
];
