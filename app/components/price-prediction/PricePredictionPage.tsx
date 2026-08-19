'use client';

import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import PageShell from '../data-governance/PageShell';
import SectionTitle from '../data-governance/SectionTitle';
import { mockData, provinceList, defaultProvince } from '../../data/mockData';

const MODELS = [
  { key: 'ensemble', label: '多模型融合', accuracy: '94.2%', desc: 'LSTM + XGBoost + ARIMA 加权融合' },
  { key: 'lstm', label: 'LSTM 时序', accuracy: '91.5%', desc: '长短期记忆网络捕捉价格周期' },
  { key: 'xgb', label: 'XGBoost', accuracy: '89.8%', desc: '梯度提升树学习多因子特征' },
  { key: 'arima', label: 'ARIMA', accuracy: '85.3%', desc: '经典时间序列基线模型' },
];

const FACTORS = [
  { name: '历史价格', weight: 0.32 },
  { name: '气象因子', weight: 0.24 },
  { name: '产量估算', weight: 0.18 },
  { name: '节假日', weight: 0.12 },
  { name: '物流成本', weight: 0.09 },
  { name: '政策', weight: 0.05 },
];

export default function PricePredictionPage() {
  const [province, setProvince] = useState(defaultProvince);
  const [model, setModel] = useState('ensemble');
  const [horizon, setHorizon] = useState('7');

  const pdata = mockData[province];
  const vegetable = pdata?.vegetablePrice?.vegetable || '蔬菜';
  const current = Number(pdata?.priceFluctuation?.current || '4.0');
  const baseHistory = pdata?.priceTrend?.avgPrice || [4, 4.2, 4.1, 4.3, 4.2, 4.4, 4.3];

  const historyDates = useMemo(() => {
    const list: string[] = [];
    const d = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const t = new Date(d);
      t.setDate(t.getDate() - i);
      list.push(`${t.getMonth() + 1}/${t.getDate()}`);
    }
    return list;
  }, []);

  const forecastDates = useMemo(() => {
    const list: string[] = [];
    const d = new Date();
    const days = Number(horizon);
    for (let i = 1; i <= days; i += 1) {
      const t = new Date(d);
      t.setDate(t.getDate() + i);
      list.push(`${t.getMonth() + 1}/${t.getDate()}`);
    }
    return list;
  }, [horizon]);

  const forecast = useMemo(() => {
    const days = Number(horizon);
    const trend = model === 'ensemble' ? 0.02 : model === 'lstm' ? 0.025 : model === 'xgb' ? 0.015 : 0.01;
    const noise = model === 'ensemble' ? 0.08 : 0.12;
    return Array.from({ length: days }, (_, i) => {
      const base = current * (1 + trend * (i + 1) + (Math.random() - 0.5) * noise);
      return Number(base.toFixed(2));
    });
  }, [current, horizon, model]);

  const upper = useMemo(() => forecast.map((v) => Number((v * 1.08).toFixed(2))), [forecast]);
  const lower = useMemo(() => forecast.map((v) => Number((v * 0.92).toFixed(2))), [forecast]);

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    legend: { data: ['历史价格', '预测价格', '置信区间'], textStyle: { color: '#6b8fa8', fontSize: 10 }, top: 0 },
    grid: { left: 40, right: 18, top: 30, bottom: 20 },
    xAxis: { type: 'category', data: [...historyDates, ...forecastDates], axisLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    yAxis: { type: 'value', name: '元/斤', nameTextStyle: { color: '#6b8fa8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(0,200,255,0.1)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10 } },
    series: [
      {
        name: '历史价格',
        type: 'line',
        data: [...baseHistory.slice(-7), ...Array(forecast.length).fill(null)],
        lineStyle: { color: '#00f2ff', width: 2 },
        itemStyle: { color: '#00f2ff' },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '预测价格',
        type: 'line',
        data: [...Array(7).fill(null), ...forecast],
        lineStyle: { color: '#34d399', width: 2, type: 'dashed' },
        itemStyle: { color: '#34d399' },
        symbol: 'circle',
        symbolSize: 6,
        markLine: {
          symbol: 'none',
          data: [{ xAxis: historyDates[historyDates.length - 1], lineStyle: { color: 'rgba(0,200,255,0.4)', type: 'dashed' }, label: { show: false } }],
        },
      },
      {
        name: '置信区间',
        type: 'line',
        data: [...Array(7).fill(null), ...upper],
        lineStyle: { opacity: 0 },
        symbol: 'none',
        areaStyle: { color: 'rgba(52,211,153,0.15)' },
        stack: 'ci',
      },
      {
        name: '置信区间',
        type: 'line',
        data: [...Array(7).fill(null), ...lower.map((v, i) => upper[i] - v)],
        lineStyle: { opacity: 0 },
        symbol: 'none',
        areaStyle: { color: '#050a15' },
        stack: 'ci',
      },
    ],
  };

  const factorOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff', fontSize: 11 } },
    grid: { left: 70, right: 18, top: 10, bottom: 20 },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,200,255,0.1)' } }, axisLabel: { color: '#6b8fa8', fontSize: 10, formatter: '{value}%' } },
    yAxis: { type: 'category', data: FACTORS.map((f) => f.name).reverse(), axisLine: { lineStyle: { color: 'rgba(0,200,255,0.3)' } }, axisLabel: { color: '#e2e8f0', fontSize: 11 } },
    series: [{ data: FACTORS.map((f) => (f.weight * 100).toFixed(0)).reverse(), type: 'bar', barWidth: 12, itemStyle: { borderRadius: [0, 4, 4, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#6c8cff' }, { offset: 1, color: '#34d399' }] } } }],
  };

  const accuracyOption = {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '90%',
      center: ['50%', '55%'],
      axisLine: { lineStyle: { width: 12, color: [[0.7, 'rgba(251,113,133,0.4)'], [0.85, 'rgba(251,146,60,0.5)'], [1, 'rgba(52,211,153,0.6)']] } },
      pointer: { itemStyle: { color: '#34d399' }, width: 4 },
      axisTick: { show: false },
      splitLine: { length: 8, lineStyle: { color: 'auto', width: 1 } },
      axisLabel: { color: '#6b8fa8', fontSize: 9, distance: 14 },
      detail: { valueAnimation: true, formatter: '{value}%', color: '#34d399', fontSize: 22, fontWeight: 'bold', offsetCenter: [0, '60%'] },
      data: [{ value: Number(MODELS.find((m) => m.key === model)?.accuracy.replace('%', '') || 90) }],
    }],
  };

  const selectedModel = MODELS.find((m) => m.key === model)!;

  return (
    <PageShell title="农产品价格预测" subtitle="多模型融合 · 短期/中期/长期价格趋势预测" icon="📈" badge="AI 驱动" badgeColor="#34d399">
      <div className="pp-controls">
        <div className="dq-filter">
          <label>省份</label>
          <select value={province} onChange={(e) => setProvince(e.target.value)}>
            {provinceList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="dq-filter">
          <label>预测模型</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {MODELS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="dq-filter">
          <label>预测周期</label>
          <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
            <option value="7">未来 7 天</option>
            <option value="30">未来 30 天</option>
            <option value="90">未来 90 天</option>
          </select>
        </div>
        <div className="pp-model-info">
          <span className="pp-model-name">{selectedModel.label}</span>
          <span className="pp-model-desc">{selectedModel.desc}</span>
        </div>
      </div>

      <SectionTitle color="#34d399" hint={`${vegetable} · ${province} · ${selectedModel.label} · 未来${horizon}天`}>
        ① 预测结果概览
      </SectionTitle>

      <div className="pp-kpis">
        <div className="pp-kpi">
          <span className="pp-kpi-label">当前均价</span>
          <span className="pp-kpi-num">{current.toFixed(2)}</span>
          <span className="pp-kpi-unit">元/斤</span>
        </div>
        <div className="pp-kpi">
          <span className="pp-kpi-label">预测均价</span>
          <span className="pp-kpi-num" style={{ color: '#34d399' }}>{(forecast.reduce((a, b) => a + b, 0) / forecast.length).toFixed(2)}</span>
          <span className="pp-kpi-unit">元/斤</span>
        </div>
        <div className="pp-kpi">
          <span className="pp-kpi-label">最高预测</span>
          <span className="pp-kpi-num" style={{ color: '#fbbf24' }}>{Math.max(...forecast).toFixed(2)}</span>
          <span className="pp-kpi-unit">元/斤</span>
        </div>
        <div className="pp-kpi">
          <span className="pp-kpi-label">最低预测</span>
          <span className="pp-kpi-num" style={{ color: '#22d3ee' }}>{Math.min(...forecast).toFixed(2)}</span>
          <span className="pp-kpi-unit">元/斤</span>
        </div>
      </div>

      <SectionTitle color="#a78bfa" hint="历史真实价格 + 未来预测价格 + 95% 置信区间">
        ② 价格预测曲线
      </SectionTitle>

      <div className="pp-main">
        <div className="pp-chart-large">
          <div className="dq-chart-title">{vegetable} 价格走势与预测</div>
          <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="pp-side-col">
          <div className="pp-chart-small">
            <div className="dq-chart-title">模型准确率</div>
            <ReactECharts option={accuracyOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="pp-chart-small">
            <div className="dq-chart-title">因子权重</div>
            <ReactECharts option={factorOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      <SectionTitle color="#fbbf24" hint="未来每一天的预测价格区间">
        ③ 预测明细
      </SectionTitle>

      <div className="dq-table-wrap">
        <table className="dq-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>预测价格（元/斤）</th>
              <th>置信区间下限</th>
              <th>置信区间上限</th>
              <th>环比变化</th>
              <th>趋势判断</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((p, i) => {
              const prev = i === 0 ? current : forecast[i - 1];
              const change = ((p - prev) / prev) * 100;
              return (
                <tr key={i}>
                  <td>{forecastDates[i]}</td>
                  <td style={{ color: '#34d399', fontWeight: 600 }}>{p.toFixed(2)}</td>
                  <td>{lower[i].toFixed(2)}</td>
                  <td>{upper[i].toFixed(2)}</td>
                  <td style={{ color: change >= 0 ? '#fb7185' : '#34d399' }}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</td>
                  <td>
                    <span className={`pp-trend ${change >= 0 ? 'up' : 'down'}`}>{change >= 0 ? '上涨' : '下跌'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
