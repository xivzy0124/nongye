'use client';

import ReactECharts from 'echarts-for-react';

export default function DecisionScore({ score }: { score: number }) {
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: '90%',
        center: ['50%', '55%'],
        splitNumber: 10,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#ff5a5a' },
              { offset: 0.5, color: '#ffcc00' },
              { offset: 1, color: '#00ff88' }
            ]
          },
          shadowColor: 'rgba(0, 255, 150, 0.4)',
          shadowBlur: 10
        },
        progress: {
          show: true,
          roundCap: true,
          width: 14
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '55%',
          width: 6,
          offsetCenter: [0, '5%'],
          itemStyle: { color: '#00ffff' }
        },
        axisLine: {
          roundCap: true,
          lineStyle: { width: 14, color: [[1, 'rgba(0, 80, 120, 0.4)']] }
        },
        axisTick: { show: false },
        splitLine: { length: 8, lineStyle: { width: 2, color: 'rgba(0, 200, 255, 0.3)' } },
        axisLabel: { distance: 18, color: '#7fdbff', fontSize: 9 },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 22,
          fontWeight: 'bold',
          color: '#00ffff',
          offsetCenter: [0, '30%'],
          formatter: '{value}'
        },
        data: [{ value: score, name: '决策评分' }]
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-cyan-200 text-xs font-bold tracking-wider mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 scale-pulse"></span>
        综合决策评分
      </h3>
      <div className="flex-1 min-h-0 relative">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
      <p className="text-center text-[10px] text-cyan-400/70 -mt-2">
        {score >= 85 ? '决策条件优越，建议积极执行' : score >= 70 ? '决策条件良好，注意风险控制' : '决策条件一般，建议谨慎观望'}
      </p>
    </div>
  );
}
