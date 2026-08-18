'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export default function VolumeMonitor() {
  const { data, currentProvince, currentCity } = useDashboard();
  const { total, sub, indicators, values } = data.volumeMonitor;
  const displayArea = currentCity || currentProvince;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 3500);
    return () => clearInterval(timer);
  }, []);

  const liveValues = useMemo(() => {
    return values.map(v => Math.min(100, Math.max(20, v + randomInt(-8, 8))));
  }, [values, tick, currentProvince, currentCity]);

  const liveTotal = useMemo(() => {
    const base = parseInt(total.replace(/,/g, ''));
    return (base + randomInt(-200, 200)).toLocaleString();
  }, [total, tick, currentProvince, currentCity]);

  const liveSub = useMemo(() => {
    const base = parseInt(sub.replace(/,/g, ''));
    return (base + randomInt(-100, 100)).toLocaleString();
  }, [sub, tick, currentProvince, currentCity]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(0, 20, 40, 0.85)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 }
    },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    radar: {
      indicator: indicators.map(name => ({ name, max: 100 })),
      center: ['50%', '58%'],
      radius: '58%',
      axisName: {
        color: '#9fe7ff',
        fontSize: 9,
        fontWeight: 'bold'
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 80, 120, 0.08)', 'rgba(0, 80, 120, 0.16)', 'rgba(0, 80, 120, 0.24)', 'rgba(0, 80, 120, 0.32)']
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(0, 200, 255, 0.25)' }
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 200, 255, 0.25)' }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: liveValues,
            name: '今日成交量',
            areaStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.5,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 255, 200, 0.5)' },
                  { offset: 1, color: 'rgba(0, 100, 150, 0.15)' }
                ]
              }
            },
            lineStyle: {
              color: '#00ffcc',
              width: 2,
              shadowColor: 'rgba(0, 255, 200, 0.6)',
              shadowBlur: 10
            },
            itemStyle: {
              color: '#00ffff',
              borderColor: '#fff',
              borderWidth: 1
            }
          },
          {
            value: liveValues.map(v => Math.min(100, Math.max(10, v - randomInt(5, 20)))),
            name: '昨日同期',
            areaStyle: {
              color: 'rgba(100, 150, 255, 0.12)'
            },
            lineStyle: {
              color: '#6699ff',
              width: 1.5,
              type: 'dashed'
            },
            itemStyle: {
              color: '#6699ff',
              borderColor: '#fff',
              borderWidth: 1
            },
            symbol: 'none'
          }
        ]
      }
    ]
  };

  return (
    <Panel title={`${displayArea}批发市场每日成交量监测`} icon="📊">
      <div className="h-full relative">
        <div className="absolute top-0 left-0 text-cyan-300 text-xs z-10">
          <span className="text-base font-bold text-cyan-400 number-roll">{liveTotal}</span>
          <span className="text-gray-400 ml-1 text-[10px]">吨</span>
        </div>
        <div className="absolute top-0 right-2 text-cyan-300 text-xs z-10">
          <span className="text-base font-bold text-green-400 number-roll">{liveSub}</span>
          <span className="text-gray-400 ml-1 text-[10px]">吨</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <div className="relative w-24 h-24 radar-sweep rounded-full"></div>
        </div>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </Panel>
  );
}
