'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface PageShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon?: string;
  children: ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  badge = '运行中',
  badgeColor = '#34d399',
  icon = '🌾',
  children,
}: PageShellProps) {
  const router = useRouter();

  return (
    <div className="agri-etl-app">
      <header className="agri-etl-header">
        <button onClick={() => router.push('/')} className="agri-back-btn" title="返回">←</button>
        <div className="agri-header-logo">{icon}</div>
        <div>
          <h1>{title}</h1>
          <p className="agri-header-sub">{subtitle}</p>
        </div>
        <span
          className="agri-header-badge"
          style={{ color: badgeColor, borderColor: `${badgeColor}66` }}
        >
          {badge}
        </span>
      </header>

      <main className="agri-etl-main">{children}</main>

      <footer className="agri-etl-footer">
        <span>价溯云图 · {title}</span>
        <span className="agri-footer-divider">|</span>
        <span>最后更新：2026-08-19</span>
      </footer>
    </div>
  );
}
