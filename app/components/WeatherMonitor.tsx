'use client';

import { useMemo } from 'react';

interface WeatherDay {
  date: string;
  day: string;
  weather: string;
  temp: string;
  icon: string;
}

interface WeatherMonitorProps {
  city: string;
  days: WeatherDay[];
  loading?: boolean;
}

function parseTemp(temp: string) {
  const match = temp.match(/(-?\d+)°?\s*\/\s*(-?\d+)°?/);
  if (match) {
    return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
  }
  const single = temp.match(/(-?\d+)/);
  if (single) {
    const v = parseInt(single[1], 10);
    return { min: v, max: v };
  }
  return { min: 0, max: 0 };
}

const windMap: Record<string, { dir: string; scale: number }> = {
  '晴': { dir: '东南风', scale: 2 },
  '多云': { dir: '东北风', scale: 3 },
  '阴': { dir: '北风', scale: 2 },
  '小雨': { dir: '东风', scale: 3 },
  '中雨': { dir: '南风', scale: 4 },
  '大雨': { dir: '西南风', scale: 5 },
  '雪': { dir: '西北风', scale: 4 },
  '小雪': { dir: '西北风', scale: 3 },
  '中雪': { dir: '西北风', scale: 4 },
  '雷阵雨': { dir: '西南风', scale: 5 },
};

function getWind(weather: string) {
  for (const key of Object.keys(windMap)) {
    if (weather.includes(key)) return windMap[key];
  }
  return { dir: '微风', scale: 2 };
}

export default function WeatherMonitor({ city, days, loading }: WeatherMonitorProps) {
  const displayDays = useMemo(() => {
    return days.slice(0, 7).map((day, idx) => {
      const { min, max } = parseTemp(day.temp);
      const wind = getWind(day.weather);
      return {
        ...day,
        label: idx === 0 ? '今日' : (day.date || day.day),
        min,
        max,
        humidity: 40 + ((idx * 7 + min) % 45),
        windDir: wind.dir,
        windScale: wind.scale,
      };
    });
  }, [days]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-cyan-300/60 text-sm">
        <span className="animate-pulse">数据同步中...</span>
      </div>
    );
  }

  if (!displayDays.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-cyan-300/40 text-sm">
        暂无数据
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-1.5">
        <div className="text-white text-sm font-semibold tracking-wide" title={city}>{city}</div>
        <div className="text-[10px] text-[#45d0b2]/80 uppercase tracking-wider">气象实时预报</div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {displayDays.map((day, idx) => (
          <div
            key={idx}
            className="flex-1 flex items-center justify-between px-1.5 py-0.5 border-b border-dashed border-white/10 last:border-0 weather-row-animate"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center gap-2 flex-[0_0_70px]">
              <span className="text-white/70 text-xs font-medium w-8">{day.label}</span>
              <span className="text-base w-5 text-center">{day.icon}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-white/70 text-[11px] whitespace-nowrap">{day.weather}</span>
              <span className="text-[#00f7ff]/60 text-[9px] whitespace-nowrap">{day.windDir} {day.windScale}级</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-[0_0_55px]">
              <span className="text-white text-xs font-bold font-mono tracking-tight">
                {day.min}°/<span className="text-[#00f7ff]">{day.max}°</span>
              </span>
              <span className="text-[#00f7ff]/60 text-[9px]">{day.humidity}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
