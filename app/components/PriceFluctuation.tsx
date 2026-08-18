'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

function randomBetween(min: number, max: number, decimals = 1) {
  const val = min + Math.random() * (max - min);
  return Number(val.toFixed(decimals));
}

export default function PriceFluctuation() {
  const { data, currentProvince, currentCity } = useDashboard();
  const { vegetable, times, prices, current } = data.priceFluctuation;
  const displayArea = currentCity || currentProvince;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const chartData = useMemo(() => {
    const livePrices = prices.map(p => Number((p + randomBetween(-0.3, 0.3)).toFixed(1)));
    const forecast = Array.from({ length: 6 }, (_, i) => {
      const last = livePrices[livePrices.length - 1];
      return Number((last + randomBetween(-0.2, 0.4)).toFixed(1));
    });
    const allData = [...livePrices, ...forecast];
    const allTimes = [...times, ...forecast.map((_, i) => `预测${i + 1}`)];
    return { livePrices, forecast, allData, allTimes };
  }, [prices, tick, currentProvince, currentCity]);

  const liveCurrent = useMemo(() => {
    const base = parseFloat(current);
    return (base + randomBetween(-0.15, 0.15)).toFixed(1);
  }, [current, tick, currentProvince, currentCity]);

  const minPrice = Math.min(...chartData.allData) - 0.5;
  const maxPrice = Math.max(...chartData.allData) + 0.5;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.85)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 },
      formatter: (params: any[]) => {
        const p = params[0];
        return `${p.axisValue}<br/>${p.marker} ${p.seriesName}: <span style="color:#00ffcc;font-weight:bold">${p.value}元/斤</span>`;
      }
    },
    grid: {
      left: '8%',
      right: '14%',
      top: '15%',
      bottom: '15%'
    },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    xAxis: {
      type: 'category',
      data: chartData.allTimes,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#1e4a6f' } },
      axisLabel: { color: '#7fdbff', fontSize: 8, rotate: 30 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: Math.floor(minPrice * 10) / 10,
      max: Math.ceil(maxPrice * 10) / 10,
      axisLine: { show: false },
      axisLabel: { color: '#7fdbff', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(30, 74, 111, 0.4)', type: 'dashed' } }
    },
    series: [
      {
        name: `${vegetable}价格`,
        type: 'line',
        data: chartData.livePrices,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: {
          color: '#00ffcc',
          width: 2.5,
          shadowColor: 'rgba(0, 255, 200, 0.5)',
          shadowBlur: 12
        },
        itemStyle: {
          color: '#00ffff',
          borderColor: '#fff',
          borderWidth: 1
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 255, 200, 0.45)' },
              { offset: 0.6, color: 'rgba(0, 150, 200, 0.15)' },
              { offset: 1, color: 'rgba(0, 100, 150, 0)' }
            ]
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高', itemStyle: { color: '#ff6666' } },
            { type: 'min', name: '最低', itemStyle: { color: '#66ccff' } }
          ],
          label: { color: '#fff', fontSize: 9 }
        },
        markLine: {
          silent: true,
          data: [{ type: 'average', name: '平均' }],
          lineStyle: { color: 'rgba(0, 200, 255, 0.5)', type: 'dashed' },
          label: { color: '#7fdbff', fontSize: 9, position: 'end' }
        }
      },
      {
        name: 'AI预测',
        type: 'line',
        data: [...Array(chartData.livePrices.length - 1).fill(null), chartData.livePrices[chartData.livePrices.length - 1], ...chartData.forecast],
        smooth: true,
        symbol: 'diamond',
        symbolSize: 5,
        lineStyle: {
          color: '#ffcc00',
          width: 2,
          type: 'dashed',
          shadowColor: 'rgba(255, 200, 0, 0.4)',
          shadowBlur: 8
        },
        itemStyle: {
          color: '#ffcc00',
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ]
  };

  return (
    <Panel title={`${displayArea}${vegetable}价格波动监测分析`} icon="💹">
      <div className="h-full relative">
        <div className="absolute top-0 right-2 flex items-center gap-1 text-xs z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
          <span className="text-cyan-300 text-[10px]">AI 实时分析</span>
        </div>
        <ReactECharts
          key={`${displayArea}-${vegetable}-fluctuation`}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <span className="text-[10px] text-cyan-400/70">当前</span>
          <span className="text-cyan-300 text-sm font-bold number-roll">{liveCurrent}</span>
          <span className="text-[10px] text-cyan-400/70">元/斤</span>
        </div>
      </div>
    </Panel>
  );
}
