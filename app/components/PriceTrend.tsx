'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

function randomBetween(min: number, max: number, decimals = 1) {
  return Number((min + Math.random() * (max - min)).toFixed(decimals));
}

export default function PriceTrend() {
  const { data } = useDashboard();
  const { years, avgPrice, maxPrice } = data.priceTrend;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(timer);
  }, []);

  const chartData = useMemo(() => {
    const liveAvg = avgPrice.map(p => Number((p + randomBetween(-0.4, 0.4)).toFixed(1)));
    const liveMax = maxPrice.map(p => Number((p + randomBetween(-0.5, 0.5)).toFixed(1)));
    return { liveAvg, liveMax };
  }, [avgPrice, maxPrice, tick, data.name]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.85)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 }
    },
    legend: {
      data: ['平均价', '极大价'],
      textStyle: { color: '#7fdbff', fontSize: 10 },
      top: 5,
      right: 10,
      itemWidth: 12,
      itemHeight: 8
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '18%',
      bottom: '15%'
    },
    animationDuration: 1200,
    animationEasing: 'elasticOut',
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: '#1e4a6f' } },
      axisLabel: { color: '#7fdbff', fontSize: 9 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '元/公斤',
      nameTextStyle: { color: '#7fdbff', fontSize: 9 },
      min: 0,
      max: 10,
      axisLine: { show: false },
      axisLabel: { color: '#7fdbff', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(30, 74, 111, 0.4)', type: 'dashed' } }
    },
    series: [
      {
        name: '平均价',
        type: 'bar',
        data: chartData.liveAvg,
        barWidth: '40%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00d4ff' },
              { offset: 0.6, color: 'rgba(0, 150, 200, 0.6)' },
              { offset: 1, color: 'rgba(0, 80, 120, 0.2)' }
            ]
          },
          shadowColor: 'rgba(0, 200, 255, 0.4)',
          shadowBlur: 8
        },
        animationDelay: (idx: number) => idx * 100
      },
      {
        name: '极大价',
        type: 'line',
        data: chartData.liveMax,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#cc66ff', width: 2.5, shadowColor: 'rgba(204, 102, 255, 0.5)', shadowBlur: 10 },
        itemStyle: { color: '#cc66ff', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(204, 102, 255, 0.4)' },
              { offset: 1, color: 'rgba(204, 102, 255, 0)' }
            ]
          }
        },
        markPoint: {
          data: [{ type: 'max', name: '峰值', itemStyle: { color: '#ff66b2' } }],
          label: { color: '#fff', fontSize: 9 }
        }
      }
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        height: 12,
        bottom: 2,
        borderColor: '#1e4a6f',
        backgroundColor: 'rgba(0, 50, 80, 0.3)',
        fillerColor: 'rgba(0, 150, 200, 0.3)',
        handleStyle: { color: '#00d4ff' },
        textStyle: { color: '#7fdbff', fontSize: 8 }
      }
    ]
  };

  return (
    <Panel title={`${data.name}菜价价格趋势`} icon="📈">
      <ReactECharts
        key={`${data.name}-trend`}
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </Panel>
  );
}
