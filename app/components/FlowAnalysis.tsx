'use client';

import ReactECharts from 'echarts-for-react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

export default function FlowAnalysis() {
  const { data } = useDashboard();
  const { categories, targets, links } = data.flowAnalysis;

  const dataNodes = [
    ...categories.map(c => ({ name: c.name, itemStyle: { color: c.color }, depth: 0 })),
    ...targets.map(t => ({ name: t.name, itemStyle: { color: t.color }, depth: 1 }))
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 }
    },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    animationEasingUpdate: 'cubicInOut',
    series: [
      {
        type: 'sankey',
        left: '1%',
        right: '18%',
        top: '3%',
        bottom: '3%',
        nodeWidth: 10,
        nodeGap: 6,
        layoutIterations: 0,
        label: {
          color: '#a8e6ff',
          fontSize: 9,
          fontFamily: 'Microsoft YaHei',
          textBorderColor: '#001020',
          textBorderWidth: 1
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.45
        },
        itemStyle: {
          borderWidth: 0,
          shadowBlur: 8,
          shadowColor: 'rgba(0, 200, 255, 0.3)'
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { opacity: 0.8 },
          itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0, 255, 255, 0.5)' }
        },
        data: dataNodes,
        links
      }
    ]
  };

  return (
    <Panel title={`${data.name}农产品流向分析`} icon="🌾">
      <ReactECharts
        key={data.name}
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </Panel>
  );
}
