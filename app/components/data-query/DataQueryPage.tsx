'use client';

import { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import PageShell from '../data-governance/PageShell';
import SectionTitle from '../data-governance/SectionTitle';
import { mockData, provinceList, defaultProvince } from '../../data/mockData';
import { wholesaleMarkets } from '../../data/wholesaleMarkets';

const varieties = ['番茄', '黄瓜', '白菜', '萝卜', '茄子', '辣椒', '土豆', '菠菜', '芹菜', '豆角', '南瓜', '冬瓜', '韭菜', '大葱', '大蒜', '生姜', '生菜', '西兰花'];

interface QueryRecord {
  id: number;
  province: string;
  city: string;
  market: string;
  variety: string;
  price: number;
  volume: number;
  date: string;
  source: string;
}

function randomDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * days));
  return d.toISOString().slice(0, 10);
}

export default function DataQueryPage() {
  const [province, setProvince] = useState(defaultProvince);
  const [city, setCity] = useState('');
  const [variety, setVariety] = useState('');
  const [market, setMarket] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [dataType, setDataType] = useState('price');
  const [page, setPage] = useState(1);

  const provinceData = mockData[province];
  const cities = useMemo(() => Object.keys(provinceData?.cities || {}), [provinceData]);
  const provinceMarkets = useMemo(
    () => wholesaleMarkets.filter((m) => m.location.startsWith(province)),
    [province]
  );

  useEffect(() => {
    setCity('');
    setMarket('');
    setPage(1);
  }, [province]);

  const records: QueryRecord[] = useMemo(() => {
    const list: QueryRecord[] = [];
    const mkts = market ? provinceMarkets.filter((m) => m.name === market) : provinceMarkets.slice(0, 12);
    const vars = variety ? [variety] : varieties.slice(0, 6);
    const targetCities = city ? [city] : cities.length ? cities : [province];
    let id = 1;
    targetCities.forEach((ct) => {
      vars.forEach((v) => {
        mkts.forEach((m) => {
          const base = Number((3 + Math.random() * 6).toFixed(1));
          list.push({
            id: id++,
            province,
            city: ct,
            market: m.name,
            variety: v,
            price: base,
            volume: Math.floor(1200 + Math.random() * 8800),
            date: randomDate(Number(dateRange)),
            source: dataType === 'price' ? '批发市场' : '田间采集',
          });
        });
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [province, city, variety, market, dateRange, dataType, provinceMarkets, cities]);

  const stats = useMemo(() => {
    const totalRecords = records.length;
    const avgPrice = totalRecords ? (records.reduce((s, r) => s + r.price, 0) / totalRecords).toFixed(2) : '0.00';
    const totalVolume = records.reduce((s, r) => s + r.volume, 0);
    const provinceSet = new Set(records.map((r) => r.province));
    const marketSet = new Set(records.map((r) => r.market));
    const varietySet = new Set(records.map((r) => r.variety));
    return { totalRecords, avgPrice, totalVolume, provinceCount: provinceSet.size, marketCount: marketSet.size, varietyCount: varietySet.size };
  }, [records]);

  const pageSize = 8;
  const paged = records.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));

  const trendData = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; vol: number }>();
    records.forEach((r) => {
      const cur = map.get(r.date) || { sum: 0, count: 0, vol: 0 };
      cur.sum += r.price;
      cur.count += 1;
      cur.vol += r.volume;
      map.set(r.date, cur);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return {
      dates: sorted.map((d) => d[0].slice(5)),
      prices: sorted.map((d) => Number((d[1].sum / d[1].count).toFixed(2))),
      volumes: sorted.map((d) => d[1].vol),
    };
  }, [records]);

  const regionData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      map.set(r.city, (map.get(r.city) || 0) + r.volume);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [records]);

  const varietyData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      map.set(r.variety, (map.get(r.variety) || 0) + r.price);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Number((value / records.filter((r) => r.variety === name).length).toFixed(2)) }));
  }, [records]);

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    grid: { left: 36, right: 18, top: 24, bottom: 20 },
    xAxis: { type: 'category', data: trendData.dates, axisLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    yAxis: { type: 'value', name: '元/斤', nameTextStyle: { color: '#6b8fa8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(0,200,255,0.1)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    series: [
      { data: trendData.prices, type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#00f2ff', width: 2 }, itemStyle: { color: '#00f2ff' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,242,255,0.35)' }, { offset: 1, color: 'rgba(0,242,255,0.02)' }] } } },
      { data: trendData.volumes.map((v) => Number((v / 1000).toFixed(1))), type: 'bar', yAxisIndex: 0, name: '成交量(千吨)', barWidth: 8, itemStyle: { color: 'rgba(0,255,200,0.4)', borderRadius: [2, 2, 0, 0] } },
    ],
  };

  const regionOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    grid: { left: 60, right: 18, top: 10, bottom: 20 },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,200,255,0.1)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    yAxis: { type: 'category', data: regionData.map((d) => d[0]).reverse(), axisLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    series: [{ data: regionData.map((d) => d[1]).reverse(), type: 'bar', barWidth: 10, itemStyle: { borderRadius: [0, 4, 4, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#6c8cff' }, { offset: 1, color: '#00f2ff' }] } } }],
  };

  const varietyOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '50%'],
        data: varietyData,
        label: { color: '#e2e8f0', fontSize: 10 },
        labelLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } },
        itemStyle: { borderColor: '#050a15', borderWidth: 2 },
      },
    ],
  };

  return (
    <PageShell title="农业数据查询中心" subtitle="田间传感 · 市场价格 · 气象灾害 · 多维度一站式检索" icon="🔍" badge="实时">
      <SectionTitle color="#00f2ff" hint="按省份/城市/品种/市场/时间维度组合筛选农业数据">
        ① 查询条件
      </SectionTitle>

      <div className="dq-filters">
        <div className="dq-filter">
          <label>省份</label>
          <select value={province} onChange={(e) => setProvince(e.target.value)}>
            {provinceList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="dq-filter">
          <label>城市</label>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">全部城市</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="dq-filter">
          <label>品种</label>
          <select value={variety} onChange={(e) => setVariety(e.target.value)}>
            <option value="">全部品种</option>
            {varieties.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="dq-filter">
          <label>市场</label>
          <select value={market} onChange={(e) => setMarket(e.target.value)}>
            <option value="">全部市场</option>
            {provinceMarkets.map((m) => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="dq-filter">
          <label>时间</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7">近 7 天</option>
            <option value="30">近 30 天</option>
            <option value="90">近 90 天</option>
          </select>
        </div>
        <div className="dq-filter">
          <label>数据类型</label>
          <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            <option value="price">批发价格</option>
            <option value="field">田间数据</option>
          </select>
        </div>
      </div>

      <SectionTitle color="#34d399" hint="本次查询结果统计">
        ② 查询概览
      </SectionTitle>

      <div className="dq-stats">
        <div className="dq-stat"><span className="dq-stat-num">{stats.totalRecords}</span><span className="dq-stat-label">记录数</span></div>
        <div className="dq-stat"><span className="dq-stat-num">{stats.avgPrice}</span><span className="dq-stat-label">均价（元/斤）</span></div>
        <div className="dq-stat"><span className="dq-stat-num">{(stats.totalVolume / 10000).toFixed(2)}</span><span className="dq-stat-label">成交量（万吨）</span></div>
        <div className="dq-stat"><span className="dq-stat-num">{stats.marketCount}</span><span className="dq-stat-label">覆盖市场</span></div>
        <div className="dq-stat"><span className="dq-stat-num">{stats.varietyCount}</span><span className="dq-stat-label">品种数</span></div>
        <div className="dq-stat"><span className="dq-stat-num">{stats.provinceCount}</span><span className="dq-stat-label">省份数</span></div>
      </div>

      <SectionTitle color="#a78bfa" hint="价格走势 / 区域分布 / 品种均价">
        ③ 数据可视化
      </SectionTitle>

      <div className="dq-charts">
        <div className="dq-chart">
          <div className="dq-chart-title">价格与成交量趋势</div>
          <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="dq-chart">
          <div className="dq-chart-title">区域成交量分布</div>
          <ReactECharts option={regionOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="dq-chart">
          <div className="dq-chart-title">品种均价占比</div>
          <ReactECharts option={varietyOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      <SectionTitle color="#fb923c" hint="点击表头可排序（当前按日期倒序）">
        ④ 明细数据
      </SectionTitle>

      <div className="dq-table-wrap">
        <table className="dq-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>省份</th>
              <th>城市</th>
              <th>市场</th>
              <th>品种</th>
              <th>价格（元/斤）</th>
              <th>成交量（吨）</th>
              <th>数据来源</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.province}</td>
                <td>{r.city}</td>
                <td title={r.market}>{r.market.length > 16 ? r.market.slice(0, 15) + '…' : r.market}</td>
                <td>{r.variety}</td>
                <td style={{ color: '#00f2ff' }}>{r.price.toFixed(2)}</td>
                <td>{r.volume.toLocaleString()}</td>
                <td><span className="dq-tag">{r.source}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dq-pager">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</button>
      </div>
    </PageShell>
  );
}
