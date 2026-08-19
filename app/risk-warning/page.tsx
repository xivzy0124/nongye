'use client';

import dynamic from 'next/dynamic';

const RiskWarningPage = dynamic(() => import('../components/risk-warning/RiskWarningPage'), {
  ssr: false,
});

export default function RiskWarningRoute() {
  return <RiskWarningPage />;
}
