'use client';

interface SectionTitleProps {
  color?: string;
  children: React.ReactNode;
  hint?: string;
}

export default function SectionTitle({ color = '#00f2ff', children, hint }: SectionTitleProps) {
  return (
    <div className="agri-section-title">
      <span className="agri-section-dot" style={{ background: color }} />
      <span className="agri-section-text">{children}</span>
      {hint && <span className="agri-section-hint">{hint}</span>}
    </div>
  );
}
