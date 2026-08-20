'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import Panel from './Panel';
import { getProvinceAdcode } from './chinaAdcodeMap';
import { useDashboard } from '../context/DashboardContext';
import { provinceList, defaultProvince } from '../data/mockData';
import WeatherMonitor from './WeatherMonitor';

const mapColors = ['#025a48', '#029a85', '#0af3c2', '#08e795'];

function hexToRgba(hex: string, opacity: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function getValueColor(value: number) {
  if (value >= 7.5) return mapColors[3];
  if (value >= 5) return mapColors[2];
  if (value >= 2.5) return mapColors[1];
  return mapColors[0];
}

export default function ChinaMap() {
  const { data, provinceData, currentProvince, currentCity, setCurrentCity, setCurrentProvince } = useDashboard();
  const chartRef = useRef<ReactECharts>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const [currentMap, setCurrentMap] = useState<'china' | 'province'>('china');
  const [provinceName, setProvinceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [animateClass, setAnimateClass] = useState('');

  const { weather, vegetablePrice } = data;
  const displayArea = currentCity || currentProvince;

  const [selectedProduct, setSelectedProduct] = useState(vegetablePrice.vegetable);
  const productOptions = useMemo(() => {
    const raw = vegetablePrice.options?.length ? vegetablePrice.options : [vegetablePrice.vegetable, '黄瓜', '西红柿'];
    return Array.from(new Set(raw));
  }, [vegetablePrice.options, vegetablePrice.vegetable]);

  const provincePriceRanking = useMemo(() => {
    const base = 3.5 + (selectedProduct.charCodeAt(0) % 50) / 20 + (displayArea.length % 3);
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i + 1);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const price = Math.max(1, base + Math.sin(i + selectedProduct.length) * 1.2 + (Math.random() - 0.5) * 0.6).toFixed(1);
      const probability = Math.min(98, Math.max(65, 70 + Math.cos(i + selectedProduct.length) * 12 + (Math.random() - 0.5) * 8)).toFixed(0);
      return { day: dateStr, price, probability };
    });
  }, [selectedProduct, displayArea, currentProvince, currentCity]);

  const generateMapData = useCallback((features: any[]) => {
    return features.map((feature: any) => {
      const name = feature.properties.name;
      const value = currentMap === 'china'
        ? (data.priceTrend?.avgPrice?.slice(-1)[0] ?? Math.random() * 10)
        : (provinceData.cities?.[name]?.priceTrend?.avgPrice?.slice(-1)[0] ?? Math.random() * 10);
      const baseColor = getValueColor(value);
      return {
        name,
        value,
        itemStyle: {
          areaColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(baseColor, 0.25) },
            { offset: 1, color: hexToRgba(baseColor, 0.05) }
          ])
        }
      };
    });
  }, [currentMap, data, provinceData]);

  const getMapOption = useCallback((mapName: string, isChina: boolean, features?: any[]): EChartsOption => {
    const dataWithGradient = features ? generateMapData(features) : [];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 70, 90, 0.9)',
        borderColor: '#60EFDB',
        borderWidth: 1,
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          if (isNaN(params.value)) return params.name;
          return `${params.name}<br/>热度值: <span style="color:#08e7de;font-weight:bold;text-shadow:0 0 5px #08e7de;">${Number(params.value).toFixed(1)}</span>`;
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 10,
        inRange: { color: mapColors }
      },
      geo: {
        show: false,
        map: mapName,
        roam: true,
        zoom: isChina ? 1.2 : 1.05
      },
      series: [
        {
          type: 'map',
          map: mapName,
          roam: true,
          zoom: isChina ? 1.2 : 1.05,
          label: {
            show: true,
            color: '#e0f7ff',
            fontSize: 10,
            textBorderColor: '#001020',
            textBorderWidth: 2
          },
          itemStyle: {
            areaColor: 'rgba(0, 70, 90, 0.2)',
            borderColor: '#60EFDB',
            borderWidth: 1.5,
            shadowColor: '#0abff3',
            shadowBlur: 15,
            shadowOffsetY: 5
          },
          emphasis: {
            label: { show: true, color: '#fff', fontSize: 12, fontWeight: 'bold' },
            itemStyle: {
              areaColor: '#BEF2E5',
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 30,
              shadowColor: '#08e7de'
            }
          },
          select: {
            itemStyle: { areaColor: '#0abff3' }
          },
          data: dataWithGradient
        }
      ]
    };
  }, [generateMapData]);

  const renderMap = useCallback((mapName: string, isChina: boolean, features?: any[]) => {
    let instance = chartInstanceRef.current;
    if (!instance || instance.isDisposed()) {
      instance = chartRef.current?.getEchartsInstance() || null;
      if (instance && !instance.isDisposed()) {
        chartInstanceRef.current = instance;
      } else {
        return;
      }
    }
    instance.setOption(getMapOption(mapName, isChina, features), true);
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
      const chinaJson = echarts.getMap('china')?.geoJson;
      renderMap('china', true, chinaJson?.features);
    }
  }, [mapReady, renderMap]);

  useEffect(() => {
    if (!chartInstanceRef.current || chartInstanceRef.current.isDisposed() || !mapReady) return;
    if (currentMap === 'china') {
      const chinaJson = echarts.getMap('china')?.geoJson;
      renderMap('china', true, chinaJson?.features);
    } else if (currentMap === 'province' && provinceName) {
      const provinceJson = echarts.getMap(provinceName)?.geoJson;
      renderMap(provinceName, false, provinceJson?.features);
    }
  }, [currentProvince, currentMap, provinceName, provinceData, mapReady, renderMap]);

  const handleClick = useCallback(async (params: any) => {
    const name = params.name || params.data?.name;
    if (!name) return;

    if (currentMap === 'province') {
      const cityKeys = Object.keys(provinceData.cities || {});
      const normalized = name.replace(/市$/g, '').replace(/地区$/g, '').replace(/自治州$/g, '').replace(/盟$/g, '');
      const cityKey = cityKeys.find(k => {
        const keyNorm = k.replace(/市$/g, '').replace(/地区$/g, '').replace(/自治州$/g, '').replace(/盟$/g, '');
        return k === name || keyNorm === normalized || normalized.startsWith(keyNorm) || k.startsWith(normalized);
      });
      // 全部城市都可点击：匹配到 mock 数据就用 mock 数据里的名字，否则直接用点击的城市名
      setCurrentCity(cityKey || name);
      return;
    }

    if (!provinceList.includes(name)) return;

    const adcode = getProvinceAdcode(name);
    if (!adcode || !chartInstanceRef.current) return;

    try {
      setLoading(true);
      const url = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const provinceJson = await response.json();
      echarts.registerMap(name, provinceJson);

      setProvinceName(name);
      setCurrentProvince(name);
      setCurrentMap('province');
      setAnimateClass('map-drill-enter');
      setTimeout(() => setAnimateClass(''), 800);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load province map:', error);
      setLoading(false);
    }
  }, [currentMap, provinceData.cities, setCurrentCity, setCurrentProvince]);

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

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      handleClickRef.current(params);
    }
  }), []);

  const onChartReady = useCallback((instance: ECharts) => {
    chartInstanceRef.current = instance;
    if (typeof window !== 'undefined') {
      (window as any).__chinaMapChart__ = instance;
    }
    if (mapReadyRef.current) {
      const map = currentMapRef.current === 'china' ? 'china' : provinceNameRef.current;
      const isChina = currentMapRef.current === 'china';
      const json = echarts.getMap(map)?.geoJson;
      renderMapRef.current(map, isChina, json?.features);
    }
  }, []);

  const handleBack = useCallback(() => {
    setCurrentMap('china');
    setProvinceName('');
    setCurrentCity('');
    setCurrentProvince(defaultProvince);
    setAnimateClass('map-back-enter');
    setTimeout(() => setAnimateClass(''), 800);
  }, [setCurrentCity, setCurrentProvince]);

  const getPercentColor = (percent: string) => {
    const val = parseInt(percent);
    if (val >= 90) return 'bg-red-500/20 text-red-300';
    if (val >= 80) return 'bg-orange-500/20 text-orange-300';
    if (val >= 70) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-green-500/20 text-green-300';
  };

  const getPercentBar = (percent: string) => Math.min(100, Math.max(20, parseInt(percent)));

  return (
    <Panel title="">
      <div className="h-full w-full relative overflow-hidden">
        {/* 装饰层 */}
        <div className="map-decor-grid"></div>
        <div className="map-radar-ring ring-1"></div>
        <div className="map-radar-ring ring-2"></div>
        <div className="map-scan-light"></div>
        <div className="map-corner top-left"></div>
        <div className="map-corner top-right"></div>
        <div className="map-corner bottom-left"></div>
        <div className="map-corner bottom-right"></div>

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
            <span className="text-[10px] text-cyan-400/60 tracking-widest">
              {currentMap === 'china' ? '全国农产品价格监测' : (currentCity ? '市级农产品价格监测' : '省级农产品价格监测')}
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-400/50"></div>
          </div>
        </div>

        {/* 返回按钮 */}
        {currentMap === 'province' && (
          <button
            onClick={handleBack}
            className="absolute top-2 left-3 z-30 w-7 h-7 flex items-center justify-center rounded text-[10px] text-[#45d0b2] border border-[#45d0b2]/50 bg-[#0a1a30]/80 hover:bg-[#45d0b2] hover:text-[#0b1525] transition-all cursor-pointer"
            title="返回上级"
          >
            ❮
          </button>
        )}

        {/* 当前区域指示 */}
        <div className="absolute top-2 right-3 z-20 px-3 py-1 rounded-full bg-[#0a1a30]/70 flex items-center gap-2 data-card pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot"></span>
          <span className="text-cyan-200 text-xs">当前区域</span>
          <span className="text-cyan-100 text-xs font-bold">{displayArea}</span>
        </div>

        {/* 左侧面板：天气 */}
        <div className="absolute top-14 left-3 w-[200px] z-20 pointer-events-auto"
          style={{
            background: 'linear-gradient(145deg, rgba(5, 20, 35, 0.5) 0%, rgba(5, 20, 35, 0.3) 100%)',
            backdropFilter: 'blur(3px)',
            border: '1px solid rgba(0, 247, 255, 0.15)',
            borderRadius: '6px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            padding: '8px 6px'
          }}>
          <WeatherMonitor city={weather.city} days={weather.days} loading={loading && weather.days.length === 0} />
          <div className="h-2 flex flex-row justify-center gap-1 items-end pb-0.5 mt-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="w-0.5 rounded-sm bg-[#00f7ff]" style={{ height: '3px', opacity: 1 - i * 0.1 }}></span>
            ))}
          </div>
        </div>

        {/* 右侧信息面板 */}
        <div className="absolute top-14 right-3 w-40 z-20 space-y-2 pointer-events-auto">
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

          <div className="data-card rounded-lg p-3 flex flex-col h-[calc(100%-70px)]">
            <div className="mb-2">
              <div className="text-[10px] text-white/80 mb-1 tracking-wider text-right">▼ 选择监测品种</div>
              <div className="relative">
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full appearance-none bg-transparent border border-cyan-400/30 rounded px-2 py-1 text-[12px] text-white font-medium text-right focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(0,200,255,0.2)] cursor-pointer"
                  style={{ direction: 'rtl' }}
                >
                  {productOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0a1a30] text-white">{opt}</option>
                  ))}
                </select>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400 text-[10px]">▼</div>
              </div>
            </div>

            <div className="w-full h-px bg-repeating-linear-gradient-90-cyan mb-2"></div>

            <h5 className="text-[#B766FF] text-xs font-bold mb-2 text-right tracking-wider"
              style={{ textShadow: '0 0 6px rgba(183, 102, 255, 0.4)' }}>
              未来7天价格预测
            </h5>

            <div className="flex-1 flex flex-col justify-between overflow-hidden gap-1">
              {provincePriceRanking.map((item, idx) => (
                <div
                  key={idx}
                  className="price-ranking-item grid grid-cols-3 gap-1 items-center px-1.5 py-0.5 rounded transition-all hover:bg-cyan-400/15 hover:border-cyan-400/40 hover:shadow-[0_0_15px_rgba(59,161,255,0.2)]"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className="text-[11px] text-white/80 font-medium text-left">{item.day}</span>
                  <div className="text-center flex items-baseline justify-center gap-0.5">
                    <span className="text-[13px] font-bold text-[#45d0b2]" style={{ textShadow: '0 0 8px rgba(69, 208, 178, 0.4)' }}>{item.price}</span>
                    <span className="text-[9px] text-[#45d0b2]">元/斤</span>
                  </div>
                  <div className="flex justify-end">
                    <div className="flex flex-col items-center justify-center bg-cyan-400/10 border border-cyan-400/25 rounded px-1 py-0.5 min-w-[42px]">
                      <span className="text-[10px] font-bold text-[#3ba1ff]" style={{ textShadow: '0 0 5px rgba(59, 161, 255, 0.4)' }}>{item.probability}%</span>
                      <span className="text-[8px] text-cyan-400/70">概率</span>
                    </div>
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
              <div className="text-cyan-400 text-sm tracking-wider">数据运算中...</div>
            </div>
          </div>
        )}

        {/* 地图 */}
        <div className={`absolute inset-0 z-10 ${animateClass}`}>
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

        {/* 右下角标签 */}
        <div className="absolute bottom-3 right-4 text-[11px] text-cyan-400/50 font-mono tracking-wider z-20 pointer-events-none">
          智慧农业数据分析平台 // 实时监控
        </div>
      </div>
    </Panel>
  );
}
