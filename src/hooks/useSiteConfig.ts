'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_SITE_CONFIG,
  type PublicSiteConfig
} from '@/lib/site-config-shared';

let siteConfigPromise: Promise<PublicSiteConfig> | null = null;

const loadSiteConfig = () => {
  if (!siteConfigPromise) {
    siteConfigPromise = fetch('/api/site-config', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Site config unavailable');
        return (await response.json()) as Partial<PublicSiteConfig>;
      })
      .then((config) => ({ ...DEFAULT_SITE_CONFIG, ...config }))
      .catch(() => DEFAULT_SITE_CONFIG);
  }
  return siteConfigPromise;
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<PublicSiteConfig>(DEFAULT_SITE_CONFIG);
  useEffect(() => {
    let active = true;
    const applyConfig = () => loadSiteConfig().then((nextConfig) => {
      if (active) setConfig(nextConfig);
    });
    applyConfig();
    const refreshOnFocus = () => { siteConfigPromise = null; void applyConfig(); };
    window.addEventListener('focus', refreshOnFocus);
    window.addEventListener('site-config-updated', applyConfig);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshOnFocus);
      window.removeEventListener('site-config-updated', applyConfig);
    };
  }, []);
  return config;
};

export const refreshSiteConfig = () => {
  siteConfigPromise = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('site-config-updated'));
  }
};
