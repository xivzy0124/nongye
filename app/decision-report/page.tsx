'use client';

import dynamic from 'next/dynamic';

const ReportContent = dynamic(() => import('../components/report/ReportContent'), {
  ssr: false,
});

export default function DecisionReportPage() {
  return (
    <div
      className="h-screen w-full overflow-hidden relative"
      style={{ background: '#050a15' }}
    >
      <div className="tech-grid fixed inset-0"></div>
      <div
        className="fixed top-0 left-0 w-full h-64 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(0, 120, 200, 0.25) 0%, transparent 65%)',
        }}
      ></div>
      <ReportContent />
    </div>
  );
}
