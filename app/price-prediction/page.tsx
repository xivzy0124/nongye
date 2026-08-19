'use client';

import dynamic from 'next/dynamic';

const PricePredictionPage = dynamic(() => import('../components/price-prediction/PricePredictionPage'), {
  ssr: false,
});

export default function PricePredictionRoute() {
  return <PricePredictionPage />;
}
