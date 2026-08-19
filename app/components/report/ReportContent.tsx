'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { generateReportData } from '../../data/reportMockData';
import KPICards from './KPICards';
import DecisionScore from './DecisionScore';
import TrendChart from './TrendChart';
import RiskRadar from './RiskRadar';
import FactorChart from './FactorChart';
import RecommendationsTable from './RecommendationsTable';
import AlertTimeline from './AlertTimeline';

export default function ReportContent() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || '河南省';
  const [refresh, setRefresh] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('zh-CN'));
  }, []);

  const report = useMemo(() => generateReportData(region), [region, refresh]);

  return (
    <div className="relative z-10 h-full max-w-[1600px] mx-auto p-3 flex flex-col">
      {/* Header */}
      <header className="flex-none flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="group flex items-center justify-center w-8 h-8 rounded-lg border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-300/60 hover:shadow-[0_0_16px_rgba(0,200,255,0.35)] transition-all duration-300"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-300"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="dashboard-title text-base lg:text-lg font-bold tracking-wider">AI 决策分析报告</h1>
            <p className="text-cyan-400/60 text-[10px]">
              区域：<span className="text-cyan-300 font-medium">{region}</span> · 生成时间：{currentTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-1 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(0,255,255,0.08),0_4px_20px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => setRefresh(r => r + 1)}
            className="neon-btn flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-md border border-cyan-400/30 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-200 hover:text-white hover:border-cyan-300/60 hover:shadow-[0_0_14px_rgba(0,200,255,0.35)] transition-all duration-300"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-ring"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
            </svg>
            刷新数据
          </button>
          <button className="neon-btn flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-md border border-cyan-400/30 bg-gradient-to-r from-green-600/20 to-cyan-600/20 text-cyan-200 hover:text-white hover:border-cyan-300/60 hover:shadow-[0_0_14px_rgba(0,255,200,0.35)] transition-all duration-300">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出报告
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        {/* KPI Cards */}
        <section className="flex-none">
          <KPICards kpis={report.kpis} />
        </section>

        {/* Score + Trend */}
        <section className="flex-[1.1] min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2">
          <div className="lg:col-span-3 rounded-lg bg-[#08101e]/85 border border-cyan-500/20 p-2.5 panel-animate"
            style={{ boxShadow: '0 0 20px rgba(0, 200, 255, 0.08)' }}>
            <DecisionScore score={report.decisionScore} />
          </div>
          <div className="lg:col-span-9 rounded-lg bg-[#08101e]/85 border border-cyan-500/20 p-2.5 panel-animate"
            style={{ animationDelay: '100ms', boxShadow: '0 0 20px rgba(0, 200, 255, 0.08)' }}>
            <TrendChart data={report.trend} />
          </div>
        </section>

        {/* Risk Radar + Factors */}
        <section className="flex-[1.1] min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#08101e]/85 border border-cyan-500/20 p-2.5 panel-animate"
            style={{ animationDelay: '200ms', boxShadow: '0 0 20px rgba(0, 200, 255, 0.08)' }}>
            <RiskRadar indicators={report.riskRadar.indicators} values={report.riskRadar.values} />
          </div>
          <div className="rounded-lg bg-[#08101e]/85 border border-cyan-500/20 p-2.5 panel-animate"
            style={{ animationDelay: '300ms', boxShadow: '0 0 20px rgba(0, 200, 255, 0.08)' }}>
            <FactorChart names={report.factors.names} values={report.factors.values} impacts={report.factors.impacts} />
          </div>
        </section>

        {/* Table + Timeline */}
        <section className="flex-[1.4] min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2">
          <div className="lg:col-span-7 rounded-lg bg-[#08101e]/85 border border-cyan-500/20 p-2.5 panel-animate"
            style={{ animationDelay: '400ms', boxShadow: '0 0 20px rgba(0, 200, 255, 0.08)' }}>
            <RecommendationsTable recommendations={report.recommendations} />
          </div>
          <div className="lg:col-span-5 rounded-lg bg-[#08101e]/85 border border-cyan-500/20 p-2.5 panel-animate"
            style={{ animationDelay: '500ms', boxShadow: '0 0 20px rgba(0, 200, 255, 0.08)' }}>
            <AlertTimeline alerts={report.alerts} />
          </div>
        </section>
      </div>
    </div>
  );
}
