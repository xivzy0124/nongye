'use client';

import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import PageShell from '../data-governance/PageShell';
import SectionTitle from '../data-governance/SectionTitle';
import { mockData, provinceList, defaultProvince } from '../../data/mockData';

const LEVELS = [
  { key: 'all', label: '全部', color: '#00f2ff' },
  { key: 'red', label: '高风险', color: '#fb7185' },
  { key: 'orange', label: '中风险', color: '#fb923c' },
  { key: 'cyan', label: '低风险', color: '#22d3ee' },
];

const CATEGORIES = [
  { key: 'price', label: '价格风险', color: '#fb7185' },
  { key: 'weather', label: '气象灾害', color: '#22d3ee' },
  { key: 'pest', label: '病虫害', color: '#a78bfa' },
  { key: 'supply', label: '供需失衡', color: '#fbbf24' },
  { key: 'logistics', label: '物流异常', color: '#34d399' },
];

interface AlertItem {
  id: number;
  province: string;
  city: string;
  level: string;
  levelColor: string;
  category: string;
  time: string;
  title: string;
  number: string;
}

export default function RiskWarningPage() {
  const [province, setProvince] = useState(defaultProvince);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const alerts: AlertItem[] = useMemo(() => {
    const list: AlertItem[] = [];
    const pdata = mockData[province];
    if (!pdata) return list;

    const cities = Object.keys(pdata.cities || {});
    const all = [
      ...(pdata.warnings || []).map((w) => ({ ...w, province, city: pdata.weather.city })),
      ...cities.flatMap((c) =>
        (pdata.cities[c].warnings || []).map((w) => ({ ...w, province, city: c }))
      ),
    ];

    all.forEach((w, idx) => {
      const cat = w.title.includes('价格') || w.title.includes('供应') ? 'price'
        : w.title.includes('雨') || w.title.includes('台风') || w.title.includes('高温') || w.title.includes('霜冻') || w.title.includes('大风') || w.title.includes('低温') || w.title.includes('道路') ? 'weather'
        : w.title.includes('病虫害') || w.title.includes('虫') ? 'pest'
        : w.title.includes('库存') || w.title.includes('销量') || w.title.includes('需求') ? 'supply'
        : 'logistics';
      list.push({
        id: idx + 1,
        province: w.province,
        city: w.city,
        level: w.level,
        levelColor: w.levelColor,
        category: cat,
        time: w.time,
        title: w.title,
        number: w.number,
      });
    });

    // 补充一些模拟预警让数据更丰富
    const extraTitles = [
      { cat: 'price', title: '{city}蔬菜价格连续3日上涨，涨幅超过15%' },
      { cat: 'weather', title: '{city}未来24小时有大风降温，注意设施加固' },
      { cat: 'pest', title: '{city}局部发现蚜虫危害，建议及时防治' },
      { cat: 'supply', title: '{city}大白菜库存偏紧，建议提前组织货源' },
      { cat: 'logistics', title: '{city}高速限行导致蔬菜运输受阻' },
    ];
    cities.slice(0, 5).forEach((c, i) => {
      const e = extraTitles[i % extraTitles.length];
      list.push({
        id: list.length + 1,
        province,
        city: c,
        level: i % 3 === 0 ? '高风险' : i % 3 === 1 ? '中风险' : '低风险',
        levelColor: i % 3 === 0 ? 'red' : i % 3 === 1 ? 'orange' : 'cyan',
        category: e.cat,
        time: `${String(8 + i).padStart(2, '0')}:${String(10 + i * 7).padStart(2, '0')}:00`,
        title: e.title.replace('{city}', c),
        number: String(9000 + list.length + 1),
      });
    });

    return list.sort((a, b) => b.time.localeCompare(a.time));
  }, [province]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const levelOk = filterLevel === 'all' || a.levelColor === filterLevel;
      const catOk = filterCategory === 'all' || a.category === filterCategory;
      return levelOk && catOk;
    });
  }, [alerts, filterLevel, filterCategory]);

  const counts = useMemo(() => {
    const total = alerts.length;
    const red = alerts.filter((a) => a.levelColor === 'red').length;
    const orange = alerts.filter((a) => a.levelColor === 'orange').length;
    const cyan = alerts.filter((a) => a.levelColor === 'cyan').length;
    const byCat = CATEGORIES.map((c) => ({
      ...c,
      count: alerts.filter((a) => a.category === c.key).length,
    }));
    return { total, red, orange, cyan, byCat };
  }, [alerts]);

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    grid: { left: 36, right: 18, top: 24, bottom: 20 },
    legend: { data: ['高风险', '中风险', '低风险'], textStyle: { color: '#6b8fa8', fontSize: 10 }, top: 0 },
    xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], axisLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,200,255,0.1)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    series: [
      { name: '高风险', type: 'line', stack: 'total', smooth: true, data: [2, 1, 4, 3, 5, 2], lineStyle: { color: '#fb7185' }, itemStyle: { color: '#fb7185' }, areaStyle: { color: 'rgba(251,113,133,0.2)' } },
      { name: '中风险', type: 'line', stack: 'total', smooth: true, data: [3, 4, 5, 6, 4, 5], lineStyle: { color: '#fb923c' }, itemStyle: { color: '#fb923c' }, areaStyle: { color: 'rgba(251,146,60,0.2)' } },
      { name: '低风险', type: 'line', stack: 'total', smooth: true, data: [5, 6, 7, 5, 6, 8], lineStyle: { color: '#22d3ee' }, itemStyle: { color: '#22d3ee' }, areaStyle: { color: 'rgba(34,211,238,0.2)' } },
    ],
  };

  const categoryOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '50%'],
      data: counts.byCat.map((c) => ({ name: c.label, value: c.count, itemStyle: { color: c.color } })),
      label: { color: '#e2e8f0', fontSize: 10 },
      labelLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } },
      itemStyle: { borderColor: '#050a15', borderWidth: 2 },
    }],
  };

  const regionOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    grid: { left: 50, right: 18, top: 10, bottom: 20 },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,200,255,0.1)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    yAxis: { type: 'category', data: provinceList.slice(0, 8).reverse(), axisLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    series: [{ data: provinceList.slice(0, 8).map(() => Math.floor(5 + Math.random() * 20)).reverse(), type: 'bar', barWidth: 12, itemStyle: { borderRadius: [0, 4, 4, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#fb7185' }, { offset: 1, color: '#fbbf24' }] } } }],
  };

  return (
    <PageShell title="农业风险预警中心" subtitle="价格波动 · 气象灾害 · 病虫害 · 供需失衡 · 实时预警" icon="⚠️" badge="运行中" badgeColor="#fb7185">
      <div className="rw-top">
        <div className="rw-filters">
          <div className="dq-filter">
            <label>省份</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)}>
              {provinceList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="dq-filter">
            <label>风险等级</label>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l.key} value={l.key}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="dq-filter">
            <label>风险类型</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">全部类型</option>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rw-summary">
          <div className="rw-sum-card total">
            <span className="rw-sum-num">{counts.total}</span>
            <span className="rw-sum-label">预警总数</span>
          </div>
          <div className="rw-sum-card red">
            <span className="rw-sum-num">{counts.red}</span>
            <span className="rw-sum-label">高风险</span>
          </div>
          <div className="rw-sum-card orange">
            <span className="rw-sum-num">{counts.orange}</span>
            <span className="rw-sum-label">中风险</span>
          </div>
          <div className="rw-sum-card cyan">
            <span className="rw-sum-num">{counts.cyan}</span>
            <span className="rw-sum-label">低风险</span>
          </div>
        </div>
      </div>

      <SectionTitle color="#fb7185" hint="24小时风险趋势 / 风险类型分布 / 省份风险排名">
        ① 风险态势
      </SectionTitle>

      <div className="dq-charts">
        <div className="dq-chart">
          <div className="dq-chart-title">24小时风险趋势</div>
          <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="dq-chart">
          <div className="dq-chart-title">风险类型分布</div>
          <ReactECharts option={categoryOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="dq-chart">
          <div className="dq-chart-title">省份风险排名</div>
          <ReactECharts option={regionOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      <SectionTitle color="#fbbf24" hint="实时滚动 · 点击卡片查看详情">
        ② 预警列表
      </SectionTitle>

      <div className="rw-alert-grid">
        {filtered.map((a) => {
          const cat = CATEGORIES.find((c) => c.key === a.category);
          return (
            <div key={a.id} className={`rw-alert-card ${a.levelColor}`}>
              <div className="rw-alert-head">
                <span className="rw-alert-level" style={{ background: a.levelColor === 'red' ? '#fb7185' : a.levelColor === 'orange' ? '#fb923c' : '#22d3ee' }}>{a.level}</span>
                <span className="rw-alert-cat" style={{ color: cat?.color || '#6b8fa8' }}>{cat?.label || a.category}</span>
                <span className="rw-alert-time">{a.time}</span>
              </div>
              <div className="rw-alert-title">{a.title}</div>
              <div className="rw-alert-meta">
                <span>{a.province} · {a.city}</span>
                <span>编号 {a.number}</span>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
