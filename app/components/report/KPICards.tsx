'use client';

import { KPICard } from '../../data/reportMockData';

const colorStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(0,200,255,0.15)]' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(255,160,50,0.15)]' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', glow: 'shadow-[0_0_20px_rgba(0,255,150,0.15)]' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(80,150,255,0.15)]' },
};

export default function KPICards({ kpis }: { kpis: KPICard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const style = colorStyles[kpi.color];
        return (
          <div
            key={kpi.label}
            className={`relative rounded-lg ${style.bg} border ${style.border} ${style.glow} p-4 overflow-hidden group panel-animate`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-cyan-200/70 text-xs mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${style.text} number-roll`}>{kpi.value}</span>
                  <span className="text-gray-400 text-xs">{kpi.unit}</span>
                </div>
                <div className={`flex items-center gap-1 mt-2 text-xs ${kpi.trendUp ? 'text-green-400' : 'text-orange-400'}`}>
                  <span className="font-bold">{kpi.trendUp ? '↑' : '↓'}</span>
                  <span>{kpi.trend}</span>
                </div>
              </div>
              <span className="text-2xl float">{kpi.icon}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
