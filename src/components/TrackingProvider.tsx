'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sendAnalyticsEvent } from '@/lib/analytics-client';

export default function TrackingProvider() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const startRef = useRef<number>(0);
  const hiddenRef = useRef(false);

  useEffect(() => {
    const now = Date.now();
    if (lastPathRef.current && lastPathRef.current !== pathname) {
      sendAnalyticsEvent(
        {
          eventName: 'page_leave',
          eventCategory: 'navigation',
          path: lastPathRef.current,
          durationMs: now - startRef.current
        },
        { beacon: true }
      );
    }

    lastPathRef.current = pathname;
    startRef.current = now;
    hiddenRef.current = false;
    sendAnalyticsEvent({
      eventName: 'page_view',
      eventCategory: 'navigation',
      path: pathname
    });
  }, [pathname]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!lastPathRef.current) return;
      if (document.visibilityState === 'hidden' && !hiddenRef.current) {
        hiddenRef.current = true;
        sendAnalyticsEvent(
          {
            eventName: 'page_engagement',
            eventCategory: 'engagement',
            path: lastPathRef.current,
            durationMs: Date.now() - startRef.current
          },
          { beacon: true }
        );
      } else if (document.visibilityState === 'visible') {
        hiddenRef.current = false;
        startRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return null;
}
