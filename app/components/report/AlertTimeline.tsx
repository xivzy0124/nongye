'use client';

import { AlertItem } from '../../data/reportMockData';

const levelMap = {
  critical: { icon: '🔴', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', label: '严重' },
  warning: { icon: '🟠', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', label: '警告' },
  info: { icon: '🔵', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', label: '提示' },
};

export default function AlertTimeline({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-cyan-200 text-xs font-bold tracking-wider mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 scale-pulse"></span>
        实时预警时间线
      </h3>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2 pr-1">
        {alerts.map((alert, idx) => {
          const level = levelMap[alert.level];
          return (
            <div
              key={alert.id}
              className={`relative rounded-lg ${level.bg} border ${level.border} p-2.5 hover:brightness-110 transition-all cursor-pointer group number-roll`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <div className="relative z-10 flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-sm scale-pulse" style={{ animationDelay: `${idx * 0.25}s` }}>{level.icon}</span>
                  <div className="w-px flex-1 bg-gradient-to-b from-cyan-500/30 to-transparent mt-1"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[11px] font-bold ${level.text}`}>{alert.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{alert.time}</span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-relaxed">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
