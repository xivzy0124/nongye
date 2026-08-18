'use client';

import ReactECharts from 'echarts-for-react';

export default function FactorChart({ names, values, impacts }: { names: string[]; values: number[]; impacts: ('positive' | 'negative')[] }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 },
      formatter: (params: any[]) => {
        const p = params[0];
        const impact = impacts[p.dataIndex] === 'positive' ? '正向影响' : '负向影响';
        return `${p.name}<br/>${impact}: <span style="color:${p.color};font-weight:bold">${p.value > 0 ? '+' : ''}${p.value}</span>`;
      }
    },
    grid: { left: '18%', right: '8%', top: '8%', bottom: '5%' },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#7fdbff', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(30, 74, 111, 0.4)', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#1e4a6f' } },
      axisLabel: { color: '#9fe7ff', fontSize: 10 }
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: impacts[i] === 'positive'
              ? {
                  type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                  colorStops: [
                    { offset: 0, color: 'rgba(0, 255, 150, 0.8)' },
                    { offset: 1, color: 'rgba(0, 200, 120, 0.3)' }
                  ]
                }
              : {
                  type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                  colorStops: [
                    { offset: 0, color: 'rgba(255, 100, 100, 0.8)' },
                    { offset: 1, color: 'rgba(200, 50, 50, 0.3)' }
                  ]
                },
            borderRadius: v >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]
          }
        })),
        barWidth: '55%',
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => `${p.value > 0 ? '+' : ''}${p.value}`,
          color: '#fff',
          fontSize: 9
        }
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-cyan-200 text-xs font-bold tracking-wider mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 scale-pulse"></span>
        关键影响因素
      </h3>
      <div className="flex-1 min-h-0 relative">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
