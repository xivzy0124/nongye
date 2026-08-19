'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

function randomBetween(min: number, max: number, decimals = 1): number {
  const val = min + Math.random() * (max - min);
  return decimals === 0 ? Math.round(val) : Number(val.toFixed(decimals));
}

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

interface Task {
  name: string;
  status: 'pending' | 'loading' | 'done';
  duration: number;
}

interface PredictionResult {
  province: string;
  city: string;
  product: string;
  basePrice: string;
  predictedPrice: string;
  trend: string;
  trendClass: string;
  confidence: string;
  details: { label: string; value: string; valueClass: string }[];
  timeline: { date: string; price: string; height: number }[];
}

export default function AIDecision() {
  const router = useRouter();
  const { data, currentProvince, currentCity } = useDashboard();
  const { aiDecision, vegetablePrice, priceFluctuation } = data;
  const { steps }: { steps: { id: number; text: string; time: string; status: string }[] } = aiDecision;
  const displayArea = currentCity || currentProvince;
  const product = vegetablePrice?.vegetable || '蔬菜';

  const [tick, setTick] = useState(0);
  const [runId, setRunId] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([
    { name: '定位区域信息', status: 'pending', duration: 0 },
    { name: '获取气象数据', status: 'pending', duration: 0 },
    { name: '加载历史价格', status: 'pending', duration: 0 },
    { name: '加载预测模型', status: 'pending', duration: 0 },
    { name: '生成策略建议', status: 'pending', duration: 0 },
  ]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [displayStep, setDisplayStep] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setShowResults(false);
    setDisplayStep(0);
    setAllLoaded(false);

    const runTask = (index: number, duration: number, delay: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setTasks(prev => {
            const next = [...prev];
            next[index] = { ...next[index], status: 'loading' };
            return next;
          });
          setTimeout(() => {
            setTasks(prev => {
              const next = [...prev];
              next[index] = { ...next[index], status: 'done', duration };
              return next;
            });
            resolve();
          }, duration);
        }, delay);
      });
    };

    setTasks(prev => prev.map((t, i) => ({
      ...t,
      name: i === 0 ? `定位区域信息: ${displayArea}` : t.name.replace(/: .*/, ''),
      status: 'pending',
      duration: 0
    })));

    const configs = [
      { min: 400, max: 800 },
      { min: 600, max: 1000 },
      { min: 500, max: 900 },
      { min: 800, max: 1400 },
      { min: 500, max: 900 },
    ];

    const run = async () => {
      const firstBatch = configs.slice(0, 4).map((c, i) =>
        runTask(i, randomInt(c.min, c.max), i * 150 + randomInt(0, 150))
      );
      await Promise.all(firstBatch);
      await new Promise(r => setTimeout(r, 200));
      await runTask(4, randomInt(configs[4].min, configs[4].max), 0);
      setAllLoaded(true);
    };

    run();
  }, [currentProvince, currentCity, displayArea, runId]);

  useEffect(() => {
    if (!allLoaded) return;

    const basePriceVal = priceFluctuation?.current ? parseFloat(priceFluctuation.current) : randomBetween(2, 8);
    const basePrice = basePriceVal.toFixed(1);
    const trend = Math.random() > 0.5 ? '上升' : '下降';
    const trendClass = trend === '上升' ? 'trend-up' : 'trend-down';
    const confidence = (85 + Math.random() * 14).toFixed(1) + '%';

    const today = new Date();
    const forecast = vegetablePrice?.forecast || [];
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i + 1);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const change = trend === '上升'
        ? randomBetween(-0.1, 0.4)
        : randomBetween(-0.3, 0.2);
      const price = Math.max(0.5, basePriceVal + change * (i + 1));
      return {
        date: dateStr,
        price: price.toFixed(1),
        height: Math.min(100, Math.max(20, (price / (basePriceVal * 1.5)) * 100))
      };
    });

    const predictedPrice = forecast.length
      ? forecast[forecast.length - 1].temp.replace(/元\/斤/, '')
      : timeline[timeline.length - 1].price;

    setResult({
      province: currentProvince,
      city: currentCity || currentProvince,
      product,
      basePrice,
      predictedPrice,
      trend,
      trendClass,
      confidence,
      details: [
        { label: '市场供需', value: trend === '上升' ? '供不应求' : '供应充足', valueClass: '' },
        { label: '季节因素', value: Math.random() > 0.5 ? '旺季效应' : '季节性回落', valueClass: '' },
        { label: '物流成本', value: '平稳', valueClass: '' },
        { label: '操作建议', value: trend === '上升' ? '建议囤货' : '随用随采', valueClass: trend === '上升' ? 'action-buy' : 'action-wait' },
      ],
      timeline
    });
  }, [allLoaded, currentProvince, currentCity, product, priceFluctuation, vegetablePrice]);

  const metrics = useMemo(() => {
    const seed = currentProvince.length + (currentCity?.length || 0) + tick;
    const jitter = (n: number) => Math.min(99, Math.max(60, n + randomInt(-5, 5)));
    return [
      { label: '预警准确率', value: `${jitter(85)}%`, color: 'text-red-400', progress: jitter(85) },
      { label: '预测准确率', value: `${jitter(82)}%`, color: 'text-cyan-400', progress: jitter(82) },
      { label: '策略有效性', value: `${jitter(91)}%`, color: 'text-green-400', progress: jitter(91) },
      { label: 'R² 分数', value: `0.${randomInt(75, 95)}`, color: 'text-yellow-400', progress: randomInt(75, 95) },
    ];
  }, [currentProvince, currentCity, tick]);

  const streamDisplayResults = async () => {
    setShowResults(true);
    setDisplayStep(1);
    await new Promise(r => setTimeout(r, 120));
    setDisplayStep(2);
    await new Promise(r => setTimeout(r, 120));
    setDisplayStep(3);
    await new Promise(r => setTimeout(r, 120));
    setDisplayStep(4);
    await new Promise(r => setTimeout(r, 120));
    setDisplayStep(5);
  };

  const resetPrediction = () => {
    setShowResults(false);
    setDisplayStep(0);
    setAllLoaded(false);
    setRunId(id => id + 1);
  };

  return (
    <Panel title="AI 智能决策分析" icon="🤖">
      <div className="h-full flex flex-col px-2 py-1 overflow-hidden relative">
        {!showResults ? (
          <>
            {/* 任务加载列表 */}
            <div className="relative flex-1 min-h-0 overflow-y-auto scrollbar-hide mb-2">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
              <div className="space-y-0">
                {tasks.map((task, idx) => (
                  <div key={idx} className={`flex items-center py-1.5 px-2 relative task-${task.status}`}>
                    <div className="w-10 flex justify-center z-10">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#0b1325]/80 border border-white/20">
                        {task.status === 'pending' && <span className="w-1 h-1 rounded-full bg-white/40"></span>}
                        {task.status === 'loading' && <span className="task-icon-spinner"></span>}
                        {task.status === 'done' && <span className="text-[#00f2ff] text-[10px]">✔</span>}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 ml-2">
                      <span className="text-[10px] text-cyan-500/50 font-mono">0{idx + 1}</span>
                      <span className={`text-[11px] ${task.status === 'done' ? 'text-white font-medium' : 'text-white/70'}`}>
                        {task.name}
                      </span>
                    </div>
                    <div className="min-w-[50px] text-right">
                      {task.status === 'done' && (
                        <span className="text-[10px] text-[#00f2ff] font-mono fade-in-text">
                          {(task.duration / 1000).toFixed(2)}s
                        </span>
                      )}
                      {task.status === 'loading' && (
                        <span className="text-[11px] text-[#00f2ff]/60 animate-pulse">...</span>
                      )}
                    </div>
                    <div
                      className="absolute bottom-0 left-0 h-px bg-[#00f2ff]/50 transition-all duration-500"
                      style={{ width: task.status === 'done' ? '100%' : '0%' }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 核心指标 */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-lg p-1.5 flex flex-col items-center justify-center relative overflow-hidden group bg-cyan-500/5 border border-cyan-500/10">
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className={`text-sm font-bold ${m.color} number-roll`}>{m.value}</span>
                  <span className="text-[10px] text-cyan-200/80">{m.label}</span>
                  <div className="w-full h-1 bg-black/30 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full progress-fill"
                      style={{
                        background: m.color.includes('red') ? 'linear-gradient(90deg, #ff5a5a, #ff8888)' :
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

            {/* 步骤 */}
            <div className="space-y-1 mb-2">
              {steps.slice(0, 3).map((step, idx) => (
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

            {/* 决策报告按钮 */}
            <div className="flex justify-center mt-auto pt-1 gap-2">
              <button
                onClick={() => router.push(`/decision-report?region=${encodeURIComponent(displayArea)}`)}
                disabled={!allLoaded}
                className={`liquid-btn px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer border ${
                  allLoaded
                    ? 'border-cyan-400/40 text-cyan-200 hover:text-[#0b1525]'
                    : 'border-cyan-400/20 text-cyan-400/40 cursor-not-allowed'
                }`}
                style={{ boxShadow: allLoaded ? '0 0 15px rgba(0, 200, 255, 0.2)' : 'none' }}
              >
                <span className="liquid-btn-content">查看决策报告</span>
              </button>
              {allLoaded && (
                <button
                  onClick={streamDisplayResults}
                  className="liquid-btn px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer border border-cyan-400/40 text-cyan-200 hover:text-[#0b1525]"
                  style={{ boxShadow: '0 0 15px rgba(0, 200, 255, 0.2)' }}
                >
                  <span className="liquid-btn-content">AI 预测</span>
                </button>
              )}
            </div>
          </>
        ) : result ? (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <span className="text-[11px] text-cyan-400 font-medium">AI 预测结果</span>
              <button
                onClick={resetPrediction}
                className="text-cyan-400/70 hover:text-cyan-300 text-xs px-1.5 py-0.5 rounded border border-cyan-400/20 hover:border-cyan-400/50 transition-colors"
              >
                返回
              </button>
            </div>

            {/* 区域信息 */}
            {displayStep >= 1 && (
              <div className="grid grid-cols-3 gap-1.5 mb-1.5 fade-in-fast">
                <div className="bg-black/20 border border-cyan-400/15 rounded p-1 text-center">
                  <div className="text-[9px] text-white/50">预测区域</div>
                  <div className="text-[10px] text-white font-bold truncate">{result.city}</div>
                </div>
                <div className="bg-black/20 border border-cyan-400/15 rounded p-1 text-center">
                  <div className="text-[9px] text-white/50">预测品种</div>
                  <div className="text-[10px] text-white font-bold truncate">{result.product}</div>
                </div>
                <div className="bg-black/20 border border-cyan-400/15 rounded p-1 text-center">
                  <div className="text-[9px] text-white/50">当前均价</div>
                  <div className="text-[10px] text-white font-bold">{result.basePrice}元</div>
                </div>
              </div>
            )}

            {/* 核心指标 */}
            {displayStep >= 2 && (
              <div className="grid grid-cols-3 gap-1.5 mb-1.5 fade-in-fast">
                <div className="bg-black/20 border border-cyan-400/15 rounded p-1 text-center">
                  <div className="text-[9px] text-white/60">下周预测</div>
                  <div className="text-xs font-bold text-[#00f2ff]">{result.predictedPrice}</div>
                  <div className="text-[8px] text-white/40">元/斤</div>
                </div>
                <div className="bg-black/20 border border-cyan-400/15 rounded p-1 text-center">
                  <div className="text-[9px] text-white/60">价格趋势</div>
                  <div className={`text-xs font-bold ${result.trendClass === 'trend-up' ? 'text-red-400' : 'text-[#00f2ff]'}`}>{result.trend}</div>
                  <div className="text-[8px] text-white/40">未来7天</div>
                </div>
                <div className="bg-black/20 border border-cyan-400/15 rounded p-1 text-center">
                  <div className="text-[9px] text-white/60">AI 置信度</div>
                  <div className="text-xs font-bold text-[#00f2ff]">{result.confidence}</div>
                  <div className="text-[8px] text-white/40">R²值</div>
                </div>
              </div>
            )}

            {/* 因子分析 */}
            {displayStep >= 3 && (
              <div className="mb-1.5 fade-in-fast">
                <div className="text-[10px] text-[#00f2ff] mb-1 border-l-2 border-[#00f2ff] pl-1.5">因子分析</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {result.details.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 border border-white/5 rounded px-1.5 py-0.5">
                      <span className="text-[9px] text-white/60">{item.label}</span>
                      <span className={`text-[9px] font-bold ${item.valueClass === 'action-buy' ? 'text-red-400' : item.valueClass === 'action-wait' ? 'text-[#00f2ff]' : 'text-white'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 趋势推演 */}
            {displayStep >= 4 && (
              <div className="flex-1 min-h-0 bg-black/20 border border-cyan-400/15 rounded p-1.5 flex flex-col fade-in-fast">
                <div className="text-[10px] text-[#00f2ff] mb-1 border-l-2 border-[#00f2ff] pl-1.5 flex-shrink-0">趋势推演</div>
                <div className="flex-1 flex items-end justify-between gap-0.5 min-h-0">
                  {result.timeline.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-[#00f2ff] mb-0.5">{day.price}</span>
                      <div className="w-full flex justify-center items-end" style={{ height: `${day.height}%`, minHeight: '4px' }}>
                        <div className="w-[60%] max-w-[14px] min-w-[4px] h-full rounded-t-sm bg-gradient-to-t from-[#00f2ff]/20 to-[#00f2ff]"></div>
                      </div>
                      <span className="text-[8px] text-white/50 mt-0.5">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 报告 */}
            {displayStep >= 5 && (
              <div className="mt-1.5 bg-gradient-to-r from-cyan-400/10 to-transparent border border-cyan-400/20 rounded p-1.5 relative overflow-hidden fade-in-fast flex-shrink-0">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00f2ff]"></div>
                <div className="text-[10px] text-[#00f2ff] mb-0.5 font-medium">深度分析报告</div>
                <p className="text-[9px] text-white/80 leading-relaxed">
                  基于 <span className="text-white font-bold">{result.province}</span> 历史数据，未来一周 <span className="text-white font-bold">{result.product}</span> 价格
                  <span className={result.trendClass === 'trend-up' ? 'text-red-400' : 'text-[#00f2ff]'}>
                    {result.trend === '上升' ? '震荡上行' : '波动回落'}
                  </span>。
                  建议{result.trend === '上升' ? '提前备货' : '按需采购'}。
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
