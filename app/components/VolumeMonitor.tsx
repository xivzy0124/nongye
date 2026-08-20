'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';
import { wholesaleMarkets, type WholesaleMarket } from '../data/wholesaleMarkets';

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function ensureMinimumMarkets(markets: WholesaleMarket[], province: string, city?: string): WholesaleMarket[] {
  if (markets.length >= 3) return markets;

  const area = city ? `${province}${city}` : province;
  const nameBase = city || province;
  const baseId = city
    ? 90000 + nameBase.charCodeAt(0)
    : 80000 + nameBase.charCodeAt(0);

  const fallbackNames = city
    ? [`${nameBase}重点农产品批发市场`, `${nameBase}中心蔬菜批发市场`, `${nameBase}综合农副产品市场`]
    : [`${nameBase}重点农产品批发市场`, `${nameBase}中心农产品批发市场`, `${nameBase}综合农产品物流园`];

  const existingIds = new Set(markets.map(m => m.id));
  const result = [...markets];

  for (let i = 0; result.length < 3 && i < fallbackNames.length; i++) {
    const id = baseId + i;
    if (!existingIds.has(id)) {
      result.push({
        id,
        name: fallbackNames[i],
        location: area,
        type: '农产品'
      });
    }
  }

  return result;
}

function getMarketsForArea(province: string, city?: string): WholesaleMarket[] {
  const realMarkets = wholesaleMarkets.filter(m => m.location.startsWith(province));

  if (city) {
    const cityName = city.replace(/市$/g, '');
    const cityMarkets = realMarkets.filter(m => m.location.includes(cityName));
    return ensureMinimumMarkets(cityMarkets, province, city);
  }

  return ensureMinimumMarkets(realMarkets, province);
}

export default function VolumeMonitor() {
  const { currentProvince, currentCity } = useDashboard();
  const displayArea = currentCity || currentProvince;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 3500);
    return () => clearInterval(timer);
  }, []);

  const markets = useMemo(() => {
    return getMarketsForArea(currentProvince, currentCity);
  }, [currentProvince, currentCity]);

  const radarMarkets = useMemo(() => {
    return markets.slice(0, 8);
  }, [markets]);

  const liveValues = useMemo(() => {
    return radarMarkets.map(m => Math.min(100, Math.max(20, 40 + (m.id % 13) * 5 + randomInt(-12, 12))));
  }, [radarMarkets, tick]);

  const totalVolume = useMemo(() => {
    return liveValues.reduce((sum, v) => sum + v, 0) * 12;
  }, [liveValues]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.85)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 10 },
      formatter: (params: any) => {
        if (!params || typeof params.dataIndex !== 'number') return params?.name || '';
        const idx = params.dataIndex;
        const market = radarMarkets[idx];
        if (!market) return params.name || '';
        return `${market.name}<br/>位置：${market.location}<br/>类型：${market.type}<br/>成交量指数：${params.value}`;
      }
    },
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    radar: {
      indicator: radarMarkets.map(m => ({ name: m.name, max: 100 })),
      center: ['50%', '56%'],
      radius: '58%',
      axisName: {
        color: '#9fe7ff',
        fontSize: 9,
        fontWeight: 'bold',
        formatter: (value: string) => {
          return value.length > 6 ? value.slice(0, 5) + '…' : value;
        }
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
          <span className="text-base font-bold text-cyan-400 number-roll">{totalVolume.toLocaleString()}</span>
          <span className="text-gray-400 ml-1 text-[10px]">吨</span>
        </div>
        <div className="absolute top-0 right-2 text-cyan-300 text-xs z-10">
          <span className="text-base font-bold text-green-400 number-roll">{markets.length}</span>
          <span className="text-gray-400 ml-1 text-[10px]">个市场</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <div className="relative w-24 h-24 radar-sweep rounded-full"></div>
        </div>
        <ReactECharts
          key={`radar-${currentProvince}-${currentCity || ''}-${radarMarkets.map(m => m.id).join('-')}`}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </Panel>
  );
}
