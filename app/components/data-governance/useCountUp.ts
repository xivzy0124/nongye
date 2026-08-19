'use client';

import { useState, useEffect } from 'react';

export default function useCountUp(target: number, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }

    let startTime: number | null = null;
    let rafId: number;

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * target));

        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };
      rafId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [target, duration, delay]);

  return value;
}
