'use client';

import { AtSign, Facebook, Ghost, Globe, Instagram, Linkedin, MessageCircle, Music2, Youtube } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

function XIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" /></svg>;
}

export default function LigueLinks({ compact = false }: { compact?: boolean }) {
  const config = useSiteConfig();
  const links = [
    { label: 'Site de la Ligue', href: 'https://liguenigerienne.org/', icon: Globe },
    { label: 'Facebook', href: config.facebookUrl, icon: Facebook },
    { label: 'Instagram', href: config.instagramUrl, icon: Instagram },
    { label: 'Snapchat', href: 'https://www.snapchat.com/@liguenigerienne', icon: Ghost },
    { label: 'X', href: config.twitterUrl, icon: XIcon },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ligue-nig%C3%A9rienne-65b43127a/', icon: Linkedin },
    { label: 'YouTube', href: config.youtubeUrl, icon: Youtube },
    { label: 'Threads', href: 'https://www.threads.com/@liguenigerienne', icon: AtSign },
    { label: 'Chaîne WhatsApp', href: 'https://www.whatsapp.com/channel/0029VaeLoj01iUxcrqmHoM0w', icon: MessageCircle },
    { label: 'TikTok', href: 'https://www.tiktok.com/@liguenigerienne', icon: Music2 },
  ];

  return <nav aria-label="La Ligue en ligne" className={compact ? 'mt-6 flex flex-wrap gap-2' : 'mt-8 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3'}>
    {links.filter(({ href }) => href).map(({ label, href, icon: Icon }) => <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (nouvel onglet)`}
      title={label}
      className={compact
        ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800'
        : 'flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800'}
    >
      <span aria-hidden="true"><Icon className="h-5 w-5 shrink-0" /></span>
      {!compact && <span>{label}</span>}
    </a>)}
  </nav>;
}
