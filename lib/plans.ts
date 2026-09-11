export interface Plan {
  id: 'free' | 'pro';
  name: string;
  priceMonthly: number; // 元/月
  priceYearly: number; // 元/年
  dailyLimit: number;
  tagline: string;
  features: string[];
}

export const PLANS: Record<'free' | 'pro', Plan> = {
  free: {
    id: 'free',
    name: '免费版',
    priceMonthly: 0,
    priceYearly: 0,
    dailyLimit: 5,
    tagline: '入门体验，每天 5 次',
    features: [
      '每天 5 次练习',
      '四维评分雷达 + 填充词检测',
      '5 大表达框架 + 6 大场景 + 题目库',
      '本地历史记录',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro 会员',
    priceMonthly: 19,
    priceYearly: 99,
    dailyLimit: 9999,
    tagline: '无限练习 + AI 教练',
    features: [
      '无限次练习（不限额）',
      'AI 深度点评（针对你每次内容）',
      'AI 一键写汇报稿',
      '历史云端同步（换设备不丢）',
      '参考答案对照',
      '优先支持',
    ],
  },
};

export function getPlan(id: string): Plan {
  return PLANS[id === 'pro' ? 'pro' : 'free'];
}
