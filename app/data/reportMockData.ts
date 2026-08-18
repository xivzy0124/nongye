export interface KPICard {
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  color: string;
}

export interface Recommendation {
  id: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  impact: string;
  confidence: number;
}

export interface AlertItem {
  id: number;
  level: 'critical' | 'warning' | 'info';
  time: string;
  title: string;
  description: string;
}

export interface ReportData {
  kpis: KPICard[];
  decisionScore: number;
  trend: {
    dates: string[];
    actual: number[];
    predicted: number[];
    upper: number[];
    lower: number[];
  };
  riskRadar: {
    indicators: string[];
    values: number[];
  };
  factors: {
    names: string[];
    values: number[];
    impacts: ('positive' | 'negative')[];
  };
  recommendations: Recommendation[];
  alerts: AlertItem[];
}

function rand(min: number, max: number, fixed = 1) {
  return Number((min + Math.random() * (max - min)).toFixed(fixed));
}

function randInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function generateReportData(region: string): ReportData {
  const baseScore = randInt(72, 94);
  const trendLength = 14;
  const dates = Array.from({ length: trendLength }, (_, i) => `09-${String(10 + i).padStart(2, '0')}`);
  const actual: number[] = [];
  const predicted: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];

  let price = rand(2.5, 5.5);
  for (let i = 0; i < trendLength; i++) {
    price = Number((price + rand(-0.4, 0.5)).toFixed(1));
    actual.push(price);
    const pred = Number((price + rand(-0.2, 0.3)).toFixed(1));
    predicted.push(pred);
    upper.push(Number((pred + rand(0.3, 0.8)).toFixed(1)));
    lower.push(Number((pred - rand(0.3, 0.8)).toFixed(1)));
  }

  return {
    kpis: [
      { label: '决策置信度', value: `${baseScore}`, unit: '%', trend: '+3.2%', trendUp: true, icon: '🎯', color: 'cyan' },
      { label: '风险指数', value: `${randInt(18, 45)}`, unit: '/100', trend: '-5.1%', trendUp: false, icon: '⚡', color: 'orange' },
      { label: '预期收益', value: `${rand(12, 28)}`, unit: '%', trend: '+2.4%', trendUp: true, icon: '💰', color: 'green' },
      { label: '建议执行', value: `${randInt(6, 14)}`, unit: '项', trend: '+1', trendUp: true, icon: '✅', color: 'blue' },
    ],
    decisionScore: baseScore,
    trend: { dates, actual, predicted, upper, lower },
    riskRadar: {
      indicators: ['市场波动', '天气风险', '供应链', '政策影响', '病虫害', '需求变化'],
      values: Array.from({ length: 6 }, () => randInt(25, 85)),
    },
    factors: {
      names: ['气温', '降雨量', '运输成本', '库存', '替代品价格', '节假日', '出口量', '种植面积'],
      values: Array.from({ length: 8 }, () => rand(-0.8, 0.9, 2)),
      impacts: Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 'positive' : 'negative') as 'positive' | 'negative'),
    },
    recommendations: [
      { id: 1, priority: 'high', category: '种植', title: `扩大 ${region} 生菜种植面积 12%`, impact: '预计增收 8.5%', confidence: randInt(82, 95) },
      { id: 2, priority: 'high', category: '销售', title: '提前 3 天出货西红柿，规避降价窗口', impact: '减少损失 5.2%', confidence: randInt(78, 92) },
      { id: 3, priority: 'medium', category: '库存', title: '增加土豆冷库储备至 15 吨', impact: '平滑供应波动', confidence: randInt(70, 85) },
      { id: 4, priority: 'medium', category: '采购', title: '锁定未来 7 天黄瓜采购合同', impact: '成本降低 3.8%', confidence: randInt(68, 82) },
      { id: 5, priority: 'low', category: '监测', title: '持续跟踪辣椒产区病虫害动态', impact: '风险可控', confidence: randInt(60, 75) },
      { id: 6, priority: 'low', category: '营销', title: '节假日 promotion 大白菜', impact: '销量提升 6%', confidence: randInt(55, 70) },
    ],
    alerts: [
      { id: 1, level: 'critical', time: '08:42', title: '高温橙色预警', description: '未来 3 天叶菜类产量预计下降 15%' },
      { id: 2, level: 'warning', time: '09:15', title: '运输成本上升', description: '燃油价格变动导致物流费用增加 6%' },
      { id: 3, level: 'info', time: '09:38', title: '需求季节性回升', description: '学校开学带动团体采购量上升' },
      { id: 4, level: 'warning', time: '10:05', title: '竞品低价冲击', description: '邻省同类产品批发价低于本地 8%' },
      { id: 5, level: 'info', time: '10:31', title: '政策支持发布', description: '冷链物流补贴申请窗口开启' },
    ],
  };
}
