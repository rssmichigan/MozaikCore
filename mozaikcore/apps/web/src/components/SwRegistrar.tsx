'use client';
import { useEffect } from 'react';

export default function SwRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('[PWA] sw.js registered'))
          .catch((e) => console.log('[PWA] sw.js registration failed', e));
      });
    }
  }, []);
  return null;
}
