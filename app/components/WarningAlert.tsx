'use client';

import { useMemo } from 'react';
import Panel from './Panel';
import { useDashboard } from '../context/DashboardContext';

type AlertLevel = 'high' | 'medium' | 'low';

const colorMap: Record<string, AlertLevel> = {
  red: 'high',
  cyan: 'medium',
  orange: 'low',
  blue: 'medium',
  yellow: 'low',
};

const levelStyle: Record<AlertLevel, { label: string; icon: string; color: string }> = {
  high: { label: '紧急风险', icon: '⚡', color: '#ff1744' },
  medium: { label: '异常预警', icon: '⚠', color: '#ff9100' },
  low: { label: '商机发现', icon: 'ℹ', color: '#00e5ff' },
};

function resolveLevel(levelColor: string): AlertLevel {
  return colorMap[levelColor] || 'medium';
}

function formatTime(time: string) {
  return time.split(' ')[0];
}

export default function WarningAlert() {
  const { data, currentProvince, currentCity } = useDashboard();
  const { warnings } = data;
  const displayArea = currentCity || currentProvince;

  const alertData = useMemo(() => {
    return warnings.slice(0, 3).map((item, index) => {
      const level = resolveLevel(item.levelColor);
      const style = levelStyle[level];
      return {
        ...item,
        level,
        label: style.label,
        icon: style.icon,
        color: style.color,
        index,
      };
    });
  }, [warnings, currentProvince, currentCity]);

  return (
    <Panel title="预警提示" icon="🚨">
      <div className="h-full flex flex-col p-1 overflow-hidden relative warning-panel">
        <div className="text-center mb-1.5">
          <span className="text-[10px] text-cyan-400/70 tracking-wider">{displayArea}实时预警监测</span>
        </div>

        <div className="flex-1 flex flex-col justify-between relative z-10">
          {alertData.map((alert, idx) => (
            <div
              key={`${alert.id}-${idx}`}
              className={`warning-log-card warning-${alert.level}`}
              style={{ '--i': idx, '--current-color': alert.color } as React.CSSProperties}
            >
              <div className="warning-status-bar"></div>

              <div className="warning-inner">
                <div className="warning-prefix">
                  <div className="warning-level-tag">{alert.label}</div>
                  <div className="warning-icon">{alert.icon}</div>
                </div>

                <div className="warning-body">
                  <div className="warning-header">
                    <span className="warning-id">编号：{alert.number}</span>
                    <span className="warning-time">{formatTime(alert.time)}</span>
                  </div>
                  <div className="warning-content" title={alert.title}>{alert.title}</div>
                </div>
              </div>

              <div className="warning-decor-line"></div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
