'use client';

import ReactECharts from 'echarts-for-react';

export default function RiskRadar({ indicators, values }: { indicators: string[]; values: number[] }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 }
    },
    radar: {
      indicator: indicators.map(name => ({ name, max: 100 })),
      center: ['50%', '55%'],
      radius: '62%',
      axisName: { color: '#9fe7ff', fontSize: 10, fontWeight: 'bold' },
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 80, 120, 0.08)', 'rgba(0, 80, 120, 0.16)', 'rgba(0, 80, 120, 0.24)', 'rgba(0, 80, 120, 0.32)']
        }
      },
      axisLine: { lineStyle: { color: 'rgba(0, 200, 255, 0.25)' } },
      splitLine: { lineStyle: { color: 'rgba(0, 200, 255, 0.25)' } }
    },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'radar',
        data: [
          {
            value: values,
            name: '风险因子',
            areaStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.5,
                colorStops: [
                  { offset: 0, color: 'rgba(255, 100, 100, 0.45)' },
                  { offset: 1, color: 'rgba(200, 50, 50, 0.1)' }
                ]
              }
            },
            lineStyle: { color: '#ff6666', width: 2, shadowColor: 'rgba(255, 100, 100, 0.5)', shadowBlur: 8 },
            itemStyle: { color: '#ff9999', borderColor: '#fff', borderWidth: 1 }
          }
        ]
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-cyan-200 text-xs font-bold tracking-wider mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 scale-pulse"></span>
        多维风险评估
      </h3>
      <div className="flex-1 min-h-0 relative">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
