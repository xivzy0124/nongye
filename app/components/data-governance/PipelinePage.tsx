'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import SectionTitle from './SectionTitle';
import UnifiedPipeline from './UnifiedPipeline';
import DetailPanel from './DetailPanel';
import { FIELD_POOL, FATE_COUNT } from '../../data/fieldFunnelData';

const FieldFunnel3D = dynamic(() => import('./FieldFunnel3D'), { ssr: false });

export default function PipelinePage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);

  const handleNodeClick = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 3200);
    const t4 = setTimeout(() => setPhase(4), 4200);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, []);

  return (
    <div className="agri-etl-app">
      <header className="agri-etl-header">
        <button
          onClick={() => router.push('/')}
          className="agri-back-btn"
          title="返回"
        >
          ←
        </button>
        <div className="agri-header-logo">🌾</div>
        <div>
          <h1>农业数据治理流水线</h1>
          <p className="agri-header-sub">田间传感数据 × 市场价格数据 → 清洗 · 标准化 · 融合 · 校验 · 入库/发布</p>
        </div>
        <span className="agri-header-badge">运行中</span>
      </header>

      <main className="agri-etl-main">
        <div className={`pipe-reveal ${phase >= 1 ? 'visible' : ''}`}>
          <SectionTitle color="#00f2ff" hint="双源异构数据 → 过滤 · 映射 · 融合 · 校验 · 入库/发布">
            ① 双源融合治理流水线
          </SectionTitle>
          <UnifiedPipeline activeId={activeId} onNodeClick={handleNodeClick} />
        </div>

        <DetailPanel activeId={activeId} onClose={() => setActiveId(null)} />

        <div className={`pipe-reveal ${phase >= 2 ? 'visible' : ''}`}>
          <SectionTitle color="#a78bfa" hint="全链路血缘追踪 · 字段级溯源 · 点击节点看关系">
            ② 全链路数据血缘图谱
          </SectionTitle>
          <div className="agri-lineage-placeholder">
            <div className="agri-lineage-card">
              <div className="agri-lineage-title">字段血缘关系</div>
              <div className="agri-lineage-grid">
                <div className="agri-lineage-item">
                  <span className="agri-lineage-dot" style={{ background: '#6c8cff' }} />
                  <span>田间传感字段</span>
                  <span className="agri-lineage-count">{FIELD_POOL.filter((f) => f.cat.includes('田间') || f.cat.includes('气象') || f.cat.includes('设备')).length}</span>
                </div>
                <div className="agri-lineage-item">
                  <span className="agri-lineage-dot" style={{ background: '#22d3ee' }} />
                  <span>市场价格字段</span>
                  <span className="agri-lineage-count">{FIELD_POOL.filter((f) => f.cat.includes('市场') || f.cat.includes('价格')).length}</span>
                </div>
                <div className="agri-lineage-item">
                  <span className="agri-lineage-dot" style={{ background: '#34d399' }} />
                  <span>融合派生字段</span>
                  <span className="agri-lineage-count">{FATE_COUNT.derive + FATE_COUNT.merge}</span>
                </div>
                <div className="agri-lineage-item">
                  <span className="agri-lineage-dot" style={{ background: '#fb923c' }} />
                  <span>输出字段</span>
                  <span className="agri-lineage-count">{FIELD_POOL.length - FATE_COUNT.filter}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`pipe-reveal ${phase >= 4 ? 'visible' : ''}`}>
          <div className="ff-bridge">
            <div className="ff-bridge-channel">
              <i /><i /><i />
            </div>
            <div className="ff-bridge-caption">
              上方血缘图谱的 <b>{FIELD_POOL.length} 个字段</b>，流经数据治理流水线
              <em>逐层 过滤 · 映射 · 融合 · 入库</em>
            </div>
          </div>
          <SectionTitle color="#22d3ee" hint={`${FIELD_POOL.length} 个字段小球 · 按转换类型逐层沉降停驻于所属层 · 悬停/点击交互`}>
            ③ 3D 字段过滤与数据沉降
          </SectionTitle>
          <FieldFunnel3D />
        </div>
      </main>

      <footer className="agri-etl-footer">
        <span>价溯云图 · 农业数据治理流水线</span>
        <span className="agri-footer-divider">|</span>
        <span>最后执行：2026-08-19 14:32:18</span>
        <span className="agri-footer-divider">|</span>
        <span>总处理记录：215,040 条</span>
      </footer>
    </div>
  );
}
