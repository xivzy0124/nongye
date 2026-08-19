'use client';

import { useState } from 'react';
import { processDetails, type DetailBlock, type ProcessDetail } from '../../data/detailData';

interface DetailPanelProps {
  activeId: string | null;
  onClose: () => void;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function stripCodeHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}

function getIconColor(type: DetailBlock['type']): string {
  switch (type) {
    case 'filter':
      return 'text-[#6c8cff] bg-[#6c8cff]/15';
    case 'transform':
      return 'text-[#22d3ee] bg-[#22d3ee]/15';
    case 'calc':
      return 'text-[#a78bfa] bg-[#a78bfa]/15';
    case 'join':
      return 'text-[#34d399] bg-[#34d399]/15';
    case 'output':
      return 'text-[#fb923c] bg-[#fb923c]/15';
    default:
      return 'text-cyan-300 bg-cyan-500/15';
  }
}

function generatePython(detail: ProcessDetail, activeId: string): string {
  const block = detail.blocks[0];
  if (!block) return '# 无可用配置';

  return `# -*- coding: utf-8 -*-
"""
${detail.title}
${stripHtml(block.desc)}
"""

import pandas as pd
from agri.etl import Pipeline, Node

# 节点配置
config = {
    "node_id": "${activeId}",
    "node_name": "${detail.title}",
    "type": "${block.type}",
}

# 初始化节点
node = Node(
    name="${detail.title}",
    node_type="${block.type}",
    config=config,
)

# 执行逻辑
def execute(input_data: pd.DataFrame) -> pd.DataFrame:
    """
    ${stripHtml(block.desc)}
    """
    result = input_data.copy()
    assert len(result) > 0, "输入数据为空"
    return result


if __name__ == "__main__":
    test_data = pd.DataFrame()
    output = execute(test_data)
    print(f"输出 {len(output)} 条记录")
`;
}

export default function DetailPanel({ activeId, onClose }: DetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [codeValues, setCodeValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'json' | 'python'>('json');

  if (!activeId || !processDetails[activeId]) return null;

  const detail = processDetails[activeId];

  const handleCodeChange = (key: string, value: string) => {
    setCodeValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal-header">
          <div className="detail-modal-title">
            <span className="detail-modal-icon">{detail.blocks[0]?.icon || '◆'}</span>
            <h3>{detail.title}</h3>
          </div>
          <div className="detail-modal-actions">
            <button
              className={`detail-edit-btn ${editing ? 'active' : ''}`}
              onClick={() => setEditing(!editing)}
            >
              {editing ? '✓ 完成编辑' : '✎ 编辑配置'}
            </button>
            <button className="detail-close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="detail-modal-body">
          <div className="detail-info-panel">
            <div className="detail-info-section">
              <h4>概述</h4>
              <p>{stripHtml(detail.body)}</p>
            </div>

            {detail.blocks.map((block, i) => (
              <div key={i} className="detail-info-section">
                <div className="detail-info-block-header">
                  <span className={`detail-block-icon ${getIconColor(block.type)}`}>{block.icon}</span>
                  <div>
                    <div className="detail-block-name">{block.name}</div>
                    <div className="detail-block-desc">{block.desc}</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="detail-info-section">
              <h4>执行统计</h4>
              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="detail-stat-label">输入记录</span>
                  <span className="detail-stat-value">
                    {activeId.includes('field-input')
                      ? '128,640'
                      : activeId.includes('market-input')
                        ? '86,400'
                        : activeId.includes('field-filter')
                          ? '128,640'
                          : activeId.includes('market-filter')
                            ? '86,400'
                            : activeId.includes('field-map')
                              ? '119,832'
                              : activeId.includes('market-map')
                                ? '81,248'
                                : activeId === 'join'
                                  ? '119,456 + 80,736'
                                  : activeId === 'quality'
                                    ? '96,384'
                                    : activeId === 'db'
                                      ? '87,416'
                                      : activeId === 'api'
                                        ? '87,416'
                                        : '—'}
                  </span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">输出记录</span>
                  <span className="detail-stat-value accent">
                    {activeId.includes('field-input')
                      ? '128,640'
                      : activeId.includes('market-input')
                        ? '86,400'
                        : activeId.includes('field-filter')
                          ? '119,832'
                          : activeId.includes('market-filter')
                            ? '81,248'
                            : activeId.includes('field-map')
                              ? '119,456'
                              : activeId.includes('market-map')
                                ? '80,736'
                                : activeId === 'join'
                                  ? '96,384'
                                  : activeId === 'quality'
                                    ? '87,416'
                                    : activeId === 'db'
                                      ? '87,416'
                                      : activeId === 'api'
                                        ? '87,416'
                                        : '—'}
                  </span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">执行耗时</span>
                  <span className="detail-stat-value">
                    {activeId.includes('input')
                      ? '18ms'
                      : activeId.includes('filter')
                        ? '62ms'
                        : activeId.includes('map')
                          ? '48ms'
                          : activeId === 'join'
                            ? '156ms'
                            : activeId === 'quality'
                              ? '89ms'
                              : activeId === 'db'
                                ? '112ms'
                                : activeId === 'api'
                                  ? '178ms'
                                  : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-code-panel">
            <div className="detail-code-tabs">
              <button
                className={`detail-tab ${activeTab === 'json' ? 'active' : ''}`}
                onClick={() => setActiveTab('json')}
              >
                {'{ }'} JSON 配置
              </button>
              <button
                className={`detail-tab ${activeTab === 'python' ? 'active' : ''}`}
                onClick={() => setActiveTab('python')}
              >
                <span className="text-[#3572A5]">Py</span> Python 代码
              </button>
              {editing && <span className="detail-code-editing-badge">可编辑</span>}
            </div>

            <div className="detail-code-body">
              {activeTab === 'json' ? (
                detail.blocks.map((block, i) => (
                  <div key={i} className="detail-code-block">
                    <div className="detail-code-block-title">
                      <span className={`detail-code-block-icon ${getIconColor(block.type)}`}>
                        {block.icon}
                      </span>
                      {block.name}
                    </div>
                    {editing ? (
                      <textarea
                        className="detail-code-editor"
                        value={codeValues[`json-${i}`] ?? stripCodeHtml(block.code)}
                        onChange={(e) => handleCodeChange(`json-${i}`, e.target.value)}
                        spellCheck={false}
                      />
                    ) : (
                      <pre
                        className="detail-code-display"
                        dangerouslySetInnerHTML={{ __html: block.code }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="detail-code-block">
                  <div className="detail-code-block-title">
                    <span className="detail-code-block-icon text-[#3572A5] bg-[#3572A5]/15">Py</span>
                    ETL Pipeline — {detail.title}
                  </div>
                  {editing ? (
                    <textarea
                      className="detail-code-editor detail-code-editor-full"
                      value={codeValues['python'] ?? generatePython(detail, activeId)}
                      onChange={(e) => handleCodeChange('python', e.target.value)}
                      spellCheck={false}
                    />
                  ) : (
                    <pre className="detail-code-display detail-code-display-full">
                      {generatePython(detail, activeId)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
