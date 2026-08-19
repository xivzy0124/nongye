'use client';

import dynamic from 'next/dynamic';

const PipelinePage = dynamic(() => import('../components/data-governance/PipelinePage'), {
  ssr: false,
});

export default function DataGovernancePage() {
  return <PipelinePage />;
}
