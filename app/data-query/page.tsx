'use client';

import dynamic from 'next/dynamic';

const DataQueryPage = dynamic(() => import('../components/data-query/DataQueryPage'), {
  ssr: false,
});

export default function DataQueryRoute() {
  return <DataQueryPage />;
}
