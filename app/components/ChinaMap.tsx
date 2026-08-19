'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import Panel from './Panel';
import { getProvinceAdcode } from './chinaAdcodeMap';
import { useDashboard } from '../context/DashboardContext';
import { provinceList, defaultProvince, mockData } from '../data/mockData';

console.log('ChinaMap module loaded v2');

export default function ChinaMap() {
  console.log('ChinaMap render');
  const { data, provinceData, currentProvince, currentCity, setCurrentCity, setCurrentProvince } = useDashboard();
  const chartRef = useRef<ReactECharts>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const [currentMap, setCurrentMap] = useState<'china' | 'province'>('china');
  const [provinceName, setProvinceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const { weather, vegetablePrice } = data;
  const displayArea = currentCity || currentProvince;

  const getMapOption = useCallback((mapName: string, isChina: boolean): EChartsOption => ({
    backgroundColor: 'transparent',
    geo: isChina ? undefined : {
      map: mapName,
      roam: true,
      zoom: 1.05,
      center: undefined,
      label: {
        show: true,
        color: '#e0f7ff',
        fontSize: 10,
        textBorderColor: '#001020',
        textBorderWidth: 2
      },
      itemStyle: {
        areaColor: {
          type: 'radial',
          x: 0.5, y: 0.5, r: 0.8,
          colorStops: [
            { offset: 0, color: 'rgba(0, 180, 220, 0.35)' },
            { offset: 0.6, color: 'rgba(0, 100, 160, 0.2)' },
            { offset: 1, color: 'rgba(0, 50, 100, 0.1)' }
          ]
        },
        borderColor: '#00eaff',
        borderWidth: 1,
        shadowColor: 'rgba(0, 230, 255, 0.35)',
        shadowBlur: 12
      },
      emphasis: {
        label: { color: '#00ffff', fontSize: 12, fontWeight: 'bold' },
        itemStyle: {
          areaColor: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: 'rgba(0, 230, 255, 0.55)' },
              { offset: 1, color: 'rgba(0, 150, 200, 0.3)' }
            ]
          },
          borderColor: '#00ffff',
          borderWidth: 2,
          shadowColor: 'rgba(0, 255, 255, 0.6)',
          shadowBlur: 16
        }
      },
      zlevel: 1
    },
    series: isChina ? [
      {
        type: 'map',
        map: mapName,
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          color: '#e0f7ff',
          fontSize: 10,
          textBorderColor: '#001020',
          textBorderWidth: 2
        },
        itemStyle: {
          areaColor: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: 'rgba(0, 180, 220, 0.35)' },
              { offset: 0.6, color: 'rgba(0, 100, 160, 0.2)' },
              { offset: 1, color: 'rgba(0, 50, 100, 0.1)' }
            ]
          },
          borderColor: '#00eaff',
          borderWidth: 1,
          shadowColor: 'rgba(0, 230, 255, 0.35)',
          shadowBlur: 12
        },
        emphasis: {
          label: { color: '#00ffff', fontSize: 12, fontWeight: 'bold' },
          itemStyle: {
            areaColor: {
              type: 'radial',
              x: 0.5, y: 0.5, r: 0.8,
              colorStops: [
                { offset: 0, color: 'rgba(0, 230, 255, 0.55)' },
                { offset: 1, color: 'rgba(0, 150, 200, 0.3)' }
              ]
            },
            borderColor: '#00ffff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 255, 255, 0.6)',
            shadowBlur: 16
          }
        },
        select: {
          label: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
          itemStyle: {
            areaColor: {
              type: 'radial',
              x: 0.5, y: 0.5, r: 0.8,
              colorStops: [
                { offset: 0, color: 'rgba(0, 255, 220, 0.65)' },
                { offset: 1, color: 'rgba(0, 180, 200, 0.35)' }
              ]
            },
            borderColor: '#00ffcc',
            borderWidth: 2,
            shadowColor: 'rgba(0, 255, 200, 0.6)',
            shadowBlur: 18
          }
        },
        data: provinceList.map(name => ({ name, selected: false, value: mockData[name]?.priceLevel ?? 0 })),
        zlevel: 2
      }
    ] : [
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: provinceData.mapCities || [],
        symbolSize: (val: any) => Math.max(6, Math.min(18, (val?.[2] || 0) * 1.8)),
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
          scale: 2.5,
          period: 4
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const name = params.name || '';
            return name.replace(/市$/, '');
          },
          position: 'right',
          color: '#00ffff',
          fontSize: 10,
          fontWeight: 'bold',
          textBorderColor: '#001020',
          textBorderWidth: 2
        },
        itemStyle: {
          color: '#00ffff',
          shadowBlur: 10,
          shadowColor: 'rgba(0, 255, 255, 0.6)'
        },
        emphasis: {
          scale: true,
          label: { color: '#ffffff', fontSize: 12 },
          itemStyle: {
            color: '#ffcc00',
            shadowBlur: 20,
            shadowColor: 'rgba(255, 200, 0, 0.8)'
          }
        },
        zlevel: 3
      }
    ]
  }), [provinceData.mapCities]);

  const renderMap = useCallback((mapName: string, isChina: boolean) => {
    let instance = chartInstanceRef.current;
    if (!instance || instance.isDisposed()) {
      instance = chartRef.current?.getEchartsInstance() || null;
      if (instance && !instance.isDisposed()) {
        chartInstanceRef.current = instance;
      } else {
        return;
      }
    }
    instance.setOption(getMapOption(mapName, isChina), true);
  }, [getMapOption]);

  useEffect(() => {
    const loadChinaMap = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const chinaJson = await response.json();
        echarts.registerMap('china', chinaJson);
        setMapReady(true);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load china map:', error);
        setLoading(false);
      }
    };
    loadChinaMap();
  }, []);

  useEffect(() => {
    if (mapReady && chartInstanceRef.current) {
      renderMap('china', true);
    }
  }, [mapReady, renderMap]);

  useEffect(() => {
    if (!chartInstanceRef.current || chartInstanceRef.current.isDisposed() || !mapReady) return;
    if (currentMap === 'china') {
      renderMap('china', true);
    } else if (currentMap === 'province' && provinceName) {
      renderMap(provinceName, false);
    }
  }, [currentProvince, currentMap, provinceName, provinceData, mapReady, renderMap]);

  const handleClick = useCallback(async (params: any) => {
    const name = params.name || params.data?.name;
    console.log('map click', params.componentType, params.seriesType, name, 'currentMap', currentMap);
    if (!name) return;

    if (currentMap === 'province') {
      const cityKeys = Object.keys(provinceData.cities || {});
      const normalized = name.replace(/市$/g, '').replace(/地区$/g, '').replace(/自治州$/g, '');
      const cityKey = cityKeys.find(k => {
        const keyNorm = k.replace(/市$/g, '').replace(/地区$/g, '').replace(/自治州$/g, '');
        return k === name || keyNorm === normalized || normalized.startsWith(keyNorm) || k.startsWith(normalized);
      });
      if (cityKey) {
        setCurrentCity(cityKey);
      }
      return;
    }

    if (!provinceList.includes(name)) return;

    const adcode = getProvinceAdcode(name);
    console.log('province click', name, adcode);
    if (!adcode || !chartInstanceRef.current) return;

    try {
      setLoading(true);
      const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`;
      console.log('fetching', url);
      const response = await fetch(url);
      console.log('fetch response', response.status);
      if (!response.ok) throw new Error('Network response was not ok');
      const provinceJson = await response.json();
      console.log('register map', name);
      echarts.registerMap(name, provinceJson);

      setProvinceName(name);
      setCurrentProvince(name);
      setCurrentMap('province');
      setLoading(false);
    } catch (error) {
      console.error('Failed to load province map:', error);
      setLoading(false);
    }
  }, [currentMap, provinceData.cities, setCurrentCity, setCurrentProvince]);

  // 使用 ref 保持回调稳定，避免每次渲染重新初始化 ECharts 实例
  const handleClickRef = useRef(handleClick);
  handleClickRef.current = handleClick;

  const renderMapRef = useRef(renderMap);
  renderMapRef.current = renderMap;

  const currentMapRef = useRef(currentMap);
  currentMapRef.current = currentMap;

  const provinceNameRef = useRef(provinceName);
  provinceNameRef.current = provinceName;

  const mapReadyRef = useRef(mapReady);
  mapReadyRef.current = mapReady;

  // 稳定的事件对象，避免每次渲染重建导致事件解绑
  const onEvents = useMemo(() => ({
    click: (params: any) => {
      console.log('echarts onEvents click', params);
      handleClickRef.current(params);
    }
  }), []);

  const onChartReady = useCallback((instance: ECharts) => {
    console.log('echarts onChartReady', instance.id, 'disposed:', instance.isDisposed());
    chartInstanceRef.current = instance;
    if (typeof window !== 'undefined') {
      (window as any).__chinaMapChart__ = instance;
    }

    if (mapReadyRef.current) {
      renderMapRef.current(currentMapRef.current === 'china' ? 'china' : provinceNameRef.current, currentMapRef.current === 'china');
    }
  }, []);

  const handleBack = useCallback(() => {
    setCurrentMap('china');
    setProvinceName('');
    setCurrentCity('');
    setCurrentProvince(defaultProvince);
  }, [setCurrentCity, setCurrentProvince]);

  const getPercentColor = (percent: string) => {
    const val = parseInt(percent);
    if (val >= 90) return 'bg-red-500/20 text-red-300';
    if (val >= 80) return 'bg-orange-500/20 text-orange-300';
    if (val >= 70) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-green-500/20 text-green-300';
  };

  const getPercentBar = (percent: string) => {
    return Math.min(100, Math.max(20, parseInt(percent)));
  };

  return (
    <Panel title="">
      <div className="h-full w-full relative overflow-hidden">
        {/* 主标题 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <h2 className="dashboard-title text-2xl font-bold tracking-[0.25em] glow-text">
            {currentMap === 'china'
              ? '价溯云图'
              : currentCity
                ? `${currentProvince} · ${currentCity}`
                : currentProvince}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-400/50"></div>
            <span className="text-[10px] text-cyan-400/60 tracking-widest">{currentMap === 'china' ? '全国农产品价格监测' : (currentCity ? '市级农产品价格监测' : '省级农产品价格监测')}</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-400/50"></div>
          </div>
        </div>

        {/* 返回按钮 */}
        {currentMap === 'province' && (
          <button
            onClick={handleBack}
            className="absolute top-2 left-3 z-30 px-3 py-1.5 text-xs text-cyan-200 rounded-lg bg-[#0a1a30]/80 hover:bg-cyan-900/50 transition-all cursor-pointer flex items-center gap-1 neon-btn"
          >
            <span>←</span>
            <span>返回全国</span>
          </button>
        )}

        {/* 当前区域指示 */}
        <div className="absolute top-2 right-3 z-20 px-3 py-1 rounded-full bg-[#0a1a30]/70 flex items-center gap-2 data-card pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
          <span className="text-cyan-200 text-xs">当前区域</span>
          <span className="text-cyan-100 text-xs font-bold">{displayArea}</span>
        </div>

        {/* 天气卡片 */}
        <div className="absolute top-14 left-3 w-44 data-card rounded-lg p-3 z-20 pointer-events-none">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-cyan-300 text-sm font-bold">{weather.city}</h4>
              <p className="text-gray-400 text-[10px]">气象实时预报</p>
            </div>
            <div className="text-3xl">{weather.days[0]?.icon || '☁️'}</div>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-hide pointer-events-auto">
            {weather.days.map((item, idx) => (
              <div key={idx} className="flex items-center text-[11px] py-1 border-b border-cyan-500/10 last:border-0">
                <span className="w-10 text-cyan-200/80">{item.date || item.day}</span>
                <span className="text-base mx-1.5">{item.icon}</span>
                <span className="text-gray-300 flex-1">{item.weather}</span>
                <span className="text-cyan-300 font-mono text-[10px]">{item.temp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧信息面板 */}
        <div className="absolute top-14 right-3 w-40 z-20 space-y-2 pointer-events-none">
          {/* 蔬菜均价 */}
          <div className="data-card rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs">¥</span>
              <div>
                <p className="text-cyan-300 text-xs font-bold">{displayArea}蔬菜均价</p>
                <p className="text-[10px] text-gray-400">实时监测中</p>
              </div>
            </div>
            <div className="w-full bg-[#0a1a30] text-cyan-200 text-xs rounded px-2 py-1.5 text-center font-medium">
              {vegetablePrice.vegetable}
            </div>
          </div>

          {/* 未来7天价格预测 */}
          <div className="data-card rounded-lg p-3">
            <h5 className="text-cyan-300 text-xs font-bold mb-2 text-center flex items-center justify-center gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
              未来7天价格预测
            </h5>
            <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-hide pointer-events-auto">
              {vegetablePrice.forecast.map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-400">{item.date}</span>
                    <span className="text-cyan-300 font-mono">{item.temp}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPercentColor(item.percent)}`}>
                      {item.percent}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#0a1a30] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                      style={{ width: `${getPercentBar(item.percent)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050a15]/60 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <div className="text-cyan-400 text-sm tracking-wider">地图加载中...</div>
            </div>
          </div>
        )}

        {/* 地图 */}
        <div className="absolute inset-0 z-10">
          <ReactECharts
            ref={chartRef}
            option={{ backgroundColor: 'transparent' }}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
            className="w-full h-full"
            onChartReady={onChartReady}
            onEvents={onEvents}
          />
        </div>

        {/* 底部提示 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-cyan-400/60 text-xs tracking-wider z-20 flex items-center gap-2 pointer-events-none">
          <span className="w-1 h-1 rounded-full bg-cyan-400 blink"></span>
          <span>{currentMap === 'china' ? '颜色深浅表示蔬菜均价，点击省份下钻' : '颜色/大小表示城市均价，点击城市切换'}</span>
        </div>
      </div>
    </Panel>
  );
}
