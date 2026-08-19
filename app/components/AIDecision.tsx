'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

function randomBetween(min: number, max: number, decimals = 1) {
  const val = min + Math.random() * (max - min);
  return decimals === 0 ? Math.round(val).toString() : val.toFixed(decimals);
}

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export default function AIDecision() {
  const router = useRouter();
  const { data, currentProvince, currentCity } = useDashboard();
  const { steps } = data.aiDecision;
  const displayArea = currentCity || currentProvince;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(timer);
  }, []);

  const metrics = useMemo(() => {
    const seed = currentProvince.length + (currentCity?.length || 0) + tick;
    const jitter = (n: number) => Math.min(99, Math.max(60, n + randomInt(-5, 5)));
    return [
      { label: '预警准确率', value: `${jitter(85)}%`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30', progress: jitter(85) },
      { label: '预测准确率', value: `${jitter(82)}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30', progress: jitter(82) },
      { label: '策略有效性', value: `${jitter(91)}%`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/30', progress: jitter(91) },
      { label: 'R² 分数', value: `0.${randomInt(75, 95)}`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30', progress: randomInt(75, 95) },
    ];
  }, [currentProvince, currentCity, tick]);

  const timeFrameMetrics = useMemo(() => [
    { label: '短期预测', mae: randomBetween(1.0, 2.0), rmse: randomBetween(2.0, 3.5), mape: `${randomInt(12, 22)}%`, acc: `${randomInt(72, 82)}%` },
    { label: '中期预测', mae: randomBetween(1.8, 3.0), rmse: randomBetween(3.2, 5.0), mape: `${randomInt(18, 28)}%`, acc: `${randomInt(65, 75)}%` },
    { label: '长期预测', mae: randomBetween(2.8, 4.5), rmse: randomBetween(4.8, 7.0), mape: `${randomInt(28, 42)}%`, acc: `${randomInt(58, 68)}%` },
  ], [tick, currentProvince, currentCity]);

  const categoryMetrics = useMemo(() => [
    { label: '大宗稳定品类', mae: randomBetween(0.8, 1.6), rmse: randomBetween(1.5, 2.6), mape: `${randomInt(15, 25)}%`, acc: `${randomInt(74, 82)}%` },
    { label: '中等波动品类', mae: randomBetween(1.2, 2.2), rmse: randomBetween(2.2, 3.4), mape: `${randomInt(22, 32)}%`, acc: `${randomInt(68, 76)}%` },
    { label: '高波动品类', mae: randomBetween(2.6, 4.0), rmse: randomBetween(3.6, 5.2), mape: `${randomInt(28, 38)}%`, acc: `${randomInt(64, 72)}%` },
  ], [tick, currentProvince, currentCity]);

  return (
    <Panel title="AI 智能决策分析" icon="🤖">
      <div className="h-full flex flex-col px-2 py-1 overflow-hidden">
        <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg bg-cyan-500/5">
          <span className="text-[10px] text-cyan-400/80">当前区域</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
            <span className="text-xs text-cyan-200 font-bold">{displayArea}</span>
          </div>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {metrics.map((m) => (
            <div key={m.label} className={`${m.bg} rounded-lg p-1.5 flex flex-col items-center justify-center relative overflow-hidden group`}>
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`text-sm font-bold ${m.color} number-roll`}>{m.value}</span>
              <span className="text-[10px] text-cyan-200/80">{m.label}</span>
              <div className="w-full h-1 bg-black/30 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full progress-fill"
                  style={{
                    background: m.color.replace('text-', '').includes('red') ? 'linear-gradient(90deg, #ff5a5a, #ff8888)' :
                      m.color.includes('cyan') ? 'linear-gradient(90deg, #00d4ff, #00ffff)' :
                      m.color.includes('green') ? 'linear-gradient(90deg, #00ff88, #66ffaa)' :
                      'linear-gradient(90deg, #ffcc00, #ffee66)',
                    '--progress': `${m.progress}%`
                  } as React.CSSProperties}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* 预测准确率 */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2 mb-2">
          <div>
            <h5 className="text-[10px] text-cyan-300 mb-1 font-bold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-400 scale-pulse"></span>
              按预测周期
            </h5>
            <div className="space-y-1">
              {timeFrameMetrics.map((row, idx) => (
                <div key={`${row.label}-${tick}`} className="grid grid-cols-5 gap-1 text-[10px] bg-cyan-500/5 rounded px-1.5 py-1 hover:bg-cyan-500/10 transition-colors" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="text-cyan-200 col-span-1 truncate">{row.label}</span>
                  <span className="text-cyan-400/70 text-right">MAE {row.mae}</span>
                  <span className="text-cyan-400/70 text-right">RMSE {row.rmse}</span>
                  <span className="text-cyan-400/70 text-right">MAPE {row.mape}</span>
                  <span className="text-green-400 text-right">{row.acc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[10px] text-cyan-300 mb-1 font-bold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-400 scale-pulse"></span>
              按蔬菜波动等级
            </h5>
            <div className="space-y-1">
              {categoryMetrics.map((row, idx) => (
                <div key={`${row.label}-${tick}`} className="grid grid-cols-5 gap-1 text-[10px] bg-cyan-500/5 rounded px-1.5 py-1 hover:bg-cyan-500/10 transition-colors" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="text-cyan-200 col-span-1 truncate">{row.label}</span>
                  <span className="text-cyan-400/70 text-right">MAE {row.mae}</span>
                  <span className="text-cyan-400/70 text-right">RMSE {row.rmse}</span>
                  <span className="text-cyan-400/70 text-right">MAPE {row.mape}</span>
                  <span className="text-green-400 text-right">{row.acc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2 group" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-all duration-300 float
                  ${step.status === 'done'
                    ? 'bg-green-500/20 border border-green-400/60 text-green-400 shadow-[0_0_8px_rgba(0,255,150,0.3)]'
                    : 'bg-gray-600/20 border border-gray-500 text-gray-400'
                  }`} style={{ animationDelay: `${idx * 0.2}s` }}>
                  {step.status === 'done' ? '✓' : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cyan-100 text-[11px] truncate group-hover:text-cyan-300 transition-colors">
                    <span className="text-cyan-500/70 mr-1 font-mono">{step.id.toString().padStart(2, '0')}</span>
                    {step.text}
                  </p>
                </div>
                <span className="text-cyan-400/60 text-[10px] font-mono bg-cyan-500/10 px-1 py-0.5 rounded">{step.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-auto pt-1">
          <button
            onClick={() => router.push(`/decision-report?region=${encodeURIComponent(displayArea)}`)}
            className="neon-btn px-6 py-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-full text-cyan-200 text-xs hover:text-white transition-colors cursor-pointer relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(0, 200, 255, 0.2)' }}
          >
            <span className="relative z-10">查看决策报告</span>
          </button>
        </div>
      </div>
    </Panel>
  );
}
