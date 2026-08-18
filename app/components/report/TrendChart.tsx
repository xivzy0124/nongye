'use client';

import ReactECharts from 'echarts-for-react';

interface TrendData {
  dates: string[];
  actual: number[];
  predicted: number[];
  upper: number[];
  lower: number[];
}

export default function TrendChart({ data }: { data: TrendData }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 11 }
    },
    legend: {
      data: ['实际价格', 'AI预测', '预测区间'],
      textStyle: { color: '#7fdbff', fontSize: 10 },
      top: 0,
      right: 0
    },
    grid: { left: '8%', right: '5%', top: '15%', bottom: '12%' },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: { lineStyle: { color: '#1e4a6f' } },
      axisLabel: { color: '#7fdbff', fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      name: '元/斤',
      nameTextStyle: { color: '#7fdbff', fontSize: 9 },
      axisLine: { show: false },
      axisLabel: { color: '#7fdbff', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(30, 74, 111, 0.4)', type: 'dashed' } }
    },
    series: [
      {
        name: '预测区间下沿',
        type: 'line',
        data: data.lower,
        smooth: true,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        stack: 'confidence',
        silent: true
      },
      {
        name: '预测区间',
        type: 'line',
        data: data.upper.map((u, i) => Number((u - data.lower[i]).toFixed(1))),
        smooth: true,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: {
          color: 'rgba(0, 200, 255, 0.18)'
        },
        stack: 'confidence'
      },
      {
        name: '实际价格',
        type: 'line',
        data: data.actual,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: '#00ffcc', width: 2.5, shadowColor: 'rgba(0, 255, 200, 0.5)', shadowBlur: 10 },
        itemStyle: { color: '#00ffff', borderColor: '#fff', borderWidth: 1 }
      },
      {
        name: 'AI预测',
        type: 'line',
        data: data.predicted,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 5,
        lineStyle: { color: '#ffcc00', width: 2, type: 'dashed', shadowColor: 'rgba(255, 200, 0, 0.4)', shadowBlur: 8 },
        itemStyle: { color: '#ffcc00', borderColor: '#fff', borderWidth: 1 }
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-cyan-200 text-xs font-bold tracking-wider mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 scale-pulse"></span>
        价格走势与预测
      </h3>
      <div className="flex-1 min-h-0 relative">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
