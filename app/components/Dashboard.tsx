'use client';

import { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import FlowAnalysis from './FlowAnalysis';
import PriceTrend from './PriceTrend';
import ChinaMap from './ChinaMap';
import VolumeMonitor from './VolumeMonitor';
import PriceFluctuation from './PriceFluctuation';
import AIDecision from './AIDecision';
import WarningAlert from './WarningAlert';

function DashboardContent() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const { data, currentProvince, currentCity } = useDashboard();
  const todayWeather = data.weather.days[0];
  const displayArea = currentCity || currentProvince;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('zh-CN', { hour12: false }));
      setCurrentDate(now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const headerButtons = ['数据查询', '风险预警', '价格预测', '辅助决策'];

  return (
    <div className="w-screen h-screen overflow-hidden relative p-3 flex flex-col"
      style={{ background: '#050a15' }}>

      {/* 科技网格背景 */}
      <div className="tech-grid"></div>

      {/* 顶部光晕 */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 120, 200, 0.25) 0%, transparent 65%)'
        }}></div>

      {/* 底部光晕 */}
      <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(0, 80, 160, 0.15) 0%, transparent 70%)'
        }}></div>

      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[2px] z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 200, 255, 0.3) 20%, rgba(0, 255, 220, 0.8) 50%, rgba(0, 200, 255, 0.3) 80%, transparent 100%)'
        }}></div>

      <header className="h-12 flex items-center justify-between relative z-10 px-2 flex-shrink-0 mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1a30]/60 data-card">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
            <span className="font-mono text-cyan-300 text-sm tracking-wider">{currentTime}</span>
            <span className="text-gray-400 text-xs">{currentDate}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a1a30]/60 data-card">
            <span className="text-base">{todayWeather?.icon || '☁️'}</span>
            <span className="text-cyan-200 text-xs">{data.weather.city}</span>
            <span className="text-cyan-300 text-xs font-medium">{todayWeather?.weather || '多云'}</span>
            <span className="text-cyan-400/80 text-xs font-mono">{todayWeather?.temp || ''}</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <h1 className="dashboard-title text-2xl font-bold tracking-[0.3em] whitespace-nowrap">
            价溯云图
          </h1>
          <p className="text-[10px] text-cyan-400/60 tracking-[0.3em] mt-0.5">农产品价格预测大模型 · 数据查询 · 风险预警 · 价格预测 · 辅助决策</p>
        </div>

        <div className="flex items-center gap-2">
          {headerButtons.map((name, idx) => (
            <button
              key={idx}
              className="neon-btn px-3 py-1.5 text-[11px] text-cyan-300 rounded-lg bg-[#0a1a30]/60 hover:text-cyan-100 hover:bg-cyan-900/40 transition-colors cursor-pointer"
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-12 gap-3 relative z-10">
        <div className="col-span-3 flex flex-col gap-3 h-full min-h-0">
          <div className="h-[55%] min-h-0 panel-animate" style={{ animationDelay: '100ms' }}>
            <FlowAnalysis />
          </div>
          <div className="h-[45%] min-h-0 panel-animate" style={{ animationDelay: '200ms' }}>
            <PriceTrend />
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-3 h-full min-h-0">
          <div className="h-[62%] min-h-0 panel-animate" style={{ animationDelay: '300ms' }}>
            <ChinaMap />
          </div>
          <div className="h-[38%] min-h-0 grid grid-cols-2 gap-3">
            <div className="min-h-0 panel-animate" style={{ animationDelay: '400ms' }}>
              <VolumeMonitor />
            </div>
            <div className="min-h-0 panel-animate" style={{ animationDelay: '500ms' }}>
              <PriceFluctuation />
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-3 h-full min-h-0">
          <div className="h-[55%] min-h-0 panel-animate" style={{ animationDelay: '600ms' }}>
            <AIDecision />
          </div>
          <div className="h-[45%] min-h-0 panel-animate" style={{ animationDelay: '700ms' }}>
            <WarningAlert />
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <div className="h-6 flex items-center justify-between relative z-10 px-2 mt-2 flex-shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-cyan-400/50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot"></span>
          <span>系统运行正常</span>
          <span>|</span>
          <span>当前区域: <span className="text-cyan-300">{displayArea}</span></span>
          <span>|</span>
          <span className="hidden sm:inline">服务对象: 农业部门 · 企业 · 合作社 · 农户 · 经销商</span>
        </div>
        <div className="text-[10px] text-cyan-400/50 tracking-wider">
          Vue.js · ECharts · Hadoop · Spark · DeepSeek · 语音交互 · 极简问答 · 双端适配
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
