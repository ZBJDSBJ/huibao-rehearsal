// 参考答案对照：练完后给一个「好版本」作对照。用【占位】标注你需要替换成自己的内容。
export const MODEL_ANSWERS: Record<string, string> = {
  weekly:
    '【结论先行】本周最重要的进展是三件事：第一，XX 项目按计划上线，转化率提升了 15%；第二，解决了 XX 阻塞问题，让下游团队能继续推进；第三，下周我重点做 XX。\n\n【补充】遇到的问题是 XX，目前我的应对是 XX，需要领导支持的是 XX。',
  project:
    '【S 情境】这个项目要解决 XX 问题，目标是在 X 周内把 XX 指标提升到 XX。\n【T 任务】我负责 XX 模块。\n【A 行动】我做了三件事：一是……二是……三是……\n【R 结果】最终指标达到 XX（提升 X%），提前 X 天完成。',
  shuzhi:
    '【结论先行】过去一年我最核心的成果是 XX，直接带来 XX 的业务价值（量化）。\n【过程】我负责了 XX，期间克服了 XX 困难，通过 XX 方法解决。\n【成长】最大的成长是 XX；不足是 XX，我的改进计划是 XX。\n【展望】明年我计划在 XX 方向发力。',
  interview:
    '【一句话定位】我是 XX，有 X 年 XX 经验，擅长 XX。\n【亮点】最有成就感的项目是 XX：当时面临 XX，我做了 XX，结果是 XX（量化）。\n【匹配】这和贵司 XX 岗位需要的 XX 能力高度匹配。\n【收尾】所以我希望能加入团队，在 XX 方向做出贡献。',
  dabian:
    '【核心观点】我的方案/论文解决的核心问题是 XX。\n【创新点】相比现有方法，我的创新在于 XX，带来了 XX 的改进（数据）。\n【证据】我通过 XX 实验/案例验证了 XX。\n【价值】这项工作的价值在于 XX，未来可以扩展到 XX。',
  pitch:
    '【痛点】目标用户正面临 XX 问题，现有方案解决不了 XX。\n【方案】我们提供 XX，核心机制是 XX。\n【差异】相比竞品，我们最大的不同是 XX。\n【商业模式】我们通过 XX 收费，市场空间是 XX。\n【团队】我们团队在 XX 方面有 XX 经验，所以能做这件事。',
};

export function getModelAnswer(scenarioId: string): string {
  return MODEL_ANSWERS[scenarioId] || MODEL_ANSWERS.weekly;
}
