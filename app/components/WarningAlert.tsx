'use client';

import { useEffect, useMemo, useState } from 'react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string; glow: string }> = {
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/50',
    text: 'text-red-400',
    icon: '🔥',
    glow: 'shadow-[0_0_14px_rgba(255,80,80,0.25)]'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    icon: '🌧️',
    glow: 'shadow-[0_0_14px_rgba(0,200,255,0.25)]'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    icon: '⚠️',
    glow: 'shadow-[0_0_14px_rgba(255,160,50,0.25)]'
  }
};

const warningTemplates = [
  { level: '高风险', levelColor: 'red', title: '极端高温天气，叶菜类产量预计下降 {pct}%' },
  { level: '中风险', levelColor: 'cyan', title: '连续降雨影响采收，{veg}价格可能上涨 {pct}%' },
  { level: '低风险', levelColor: 'orange', title: '{veg}市场供应量充足，价格趋于稳定' },
  { level: '高风险', levelColor: 'red', title: '病虫害预警：{veg}产区需加强监测' },
  { level: '中风险', levelColor: 'cyan', title: '运输成本上升，{veg}批发价波动 {pct}%' },
  { level: '低风险', levelColor: 'orange', title: '节日效应消退，{veg}需求回归常态' },
];

const vegetables = ['生菜', '黄瓜', '西红柿', '大白菜', '土豆', '辣椒', '茄子', '豆角', '菠菜', '芹菜'];

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export default function WarningAlert() {
  const { data, currentProvince, currentCity } = useDashboard();
  const { warnings: baseWarnings } = data;
  const displayArea = currentCity || currentProvince;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const warnings = useMemo(() => {
    const dynamic = Array.from({ length: 5 }, (_, i) => {
      const tpl = warningTemplates[(i + tick) % warningTemplates.length];
      const veg = vegetables[(i + currentProvince.length + tick) % vegetables.length];
      const pct = randomInt(5, 35);
      const colors = colorMap[tpl.levelColor];
      return {
        id: i + 1,
        level: tpl.level,
        levelColor: tpl.levelColor,
        time: `${String(randomInt(8, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`,
        title: tpl.title.replace('{veg}', veg).replace('{pct}', String(pct)),
        number: String(randomInt(1000, 9999)),
        ...colors
      };
    });
    return dynamic;
  }, [baseWarnings, currentProvince, currentCity, tick]);

  return (
    <Panel title="预警提示" icon="🚨">
      <div className="h-full flex flex-col gap-2 p-1 overflow-hidden justify-between">
        <div className="text-center mb-1">
          <span className="text-[10px] text-cyan-400/70 tracking-wider">{displayArea}实时预警监测</span>
        </div>
        {warnings.map((warning, idx) => (
          <div
            key={`${warning.id}-${tick}`}
            className={`${warning.bg} border-l-2 ${warning.border} ${warning.glow} p-2 rounded-r text-xs flex gap-2 hover:brightness-110 transition-all cursor-pointer relative overflow-hidden group number-roll`}
            style={{ animationDelay: `${idx * 120}ms` }}
          >
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className={`${warning.text} text-lg flex-shrink-0 flex items-center scale-pulse`} style={{ animationDelay: `${idx * 0.3}s` }}>
              {warning.icon}
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`${warning.text} font-bold text-[11px]`}>{warning.level}</span>
                <span className="text-gray-500 text-[10px] font-mono">NO.{warning.number}</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-[10px]">{warning.title}</p>
              <p className="text-gray-500 text-[10px] mt-1 text-right font-mono">{warning.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
