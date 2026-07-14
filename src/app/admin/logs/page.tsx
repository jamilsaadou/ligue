import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Flag,
  LogOut,
  MapPin,
  Monitor,
  MousePointerClick,
  Search,
  Share2,
  Smartphone,
  UserRound,
  UsersRound,
  type LucideIcon
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 25;

const EVENT_OPTIONS = [
  { value: 'all', label: 'Tous les événements' },
  { value: 'page_view', label: 'Pages vues' },
  { value: 'page_engagement', label: 'Engagement' },
  { value: 'diagnostic_started', label: 'Diagnostics commencés' },
  { value: 'diagnostic_progress', label: 'Progression diagnostic' },
  { value: 'diagnostic_completed', label: 'Diagnostics terminés' },
  { value: 'diagnostic_result_shared', label: 'Résultats partagés' },
  { value: 'diagnostic_result_downloaded', label: 'Images téléchargées' }
];

const EVENT_LABELS: Record<
  string,
  { label: string; tone: string; icon: LucideIcon }
> = {
  page_view: { label: 'Page vue', tone: 'bg-blue-50 text-blue-700', icon: Eye },
  page_leave: { label: 'Sortie de page', tone: 'bg-slate-100 text-slate-700', icon: LogOut },
  page_engagement: { label: 'Engagement', tone: 'bg-violet-50 text-violet-700', icon: Clock3 },
  diagnostic_started: { label: 'Diagnostic commencé', tone: 'bg-orange-50 text-orange-700', icon: MousePointerClick },
  diagnostic_progress: { label: 'Progression', tone: 'bg-amber-50 text-amber-700', icon: Activity },
  diagnostic_completed: { label: 'Diagnostic terminé', tone: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  diagnostic_result_shared: { label: 'Résultat partagé', tone: 'bg-pink-50 text-pink-700', icon: Share2 },
  diagnostic_result_downloaded: { label: 'Image téléchargée', tone: 'bg-cyan-50 text-cyan-700', icon: Share2 }
};

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return 'Durée non mesurée';
  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.round((durationMs % 60_000) / 1000);
  return minutes ? `${minutes} min ${seconds}s` : `${seconds}s`;
};

const getMetadata = (metadata: Prisma.JsonValue | null) =>
  metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? (metadata as Record<string, Prisma.JsonValue>)
    : {};

const getEventDetails = (eventName: string, metadata: Prisma.JsonValue | null) => {
  const data = getMetadata(metadata);
  if (eventName === 'diagnostic_started') {
    return `${data.mode === 'other' ? 'Pour un proche' : 'Mode personnel'} · ${data.totalQuestions || 0} questions`;
  }
  if (eventName === 'diagnostic_progress') {
    return `Palier ${data.milestone || 0}% · ${data.answersCount || 0} réponses`;
  }
  if (eventName === 'diagnostic_completed') {
    const level = data.level === 'danger' ? 'Danger' : data.level === 'warning' ? 'Vigilance' : 'Relation saine';
    return `${level} · score ${data.totalScore || 0}/${data.maxScore || 0}`;
  }
  if (eventName.includes('shared') || eventName.includes('downloaded')) {
    return `Image ${String(data.format || 'PNG').toUpperCase()} · ${data.method || 'partage'}`;
  }
  return null;
};

const pageHref = (page: number, type: string, query: string) => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (type !== 'all') params.set('type', type);
  if (query) params.set('q', query);
  return `/admin/logs?${params.toString()}`;
};

export default async function AdminLogsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pageParam = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const requestedType = Array.isArray(params.type) ? params.type[0] : params.type;
  const type = EVENT_OPTIONS.some((option) => option.value === requestedType)
    ? requestedType!
    : 'all';
  const query = String(Array.isArray(params.q) ? params.q[0] || '' : params.q || '').trim().slice(0, 100);

  const where: Prisma.TrackingEventWhereInput = {
    ...(type !== 'all' ? { eventName: type } : {}),
    ...(query
      ? {
          OR: [
            { eventName: { contains: query, mode: 'insensitive' } },
            { path: { contains: query, mode: 'insensitive' } },
            { sessionId: { contains: query, mode: 'insensitive' } },
            { country: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { browser: { contains: query, mode: 'insensitive' } },
            { os: { contains: query, mode: 'insensitive' } },
            { deviceType: { contains: query, mode: 'insensitive' } },
            { referrer: { contains: query, mode: 'insensitive' } },
            { utmSource: { contains: query, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, logs, uniqueSessions, averageDuration] = await Promise.all([
    prisma.trackingEvent.count({ where }),
    prisma.trackingEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } }
    }),
    prisma.trackingEvent.groupBy({
      by: ['sessionId'],
      where: { ...where, sessionId: { not: null } }
    }),
    prisma.trackingEvent.aggregate({ where, _avg: { durationMs: true } })
  ]);

  const diagnosticIds = Array.from(
    new Set(logs.map((log) => log.diagnosticId).filter((id): id is string => Boolean(id)))
  );
  const diagnosticRows = diagnosticIds.length
    ? await prisma.diagnostic.findMany({
        where: { id: { in: diagnosticIds } },
        select: { id: true, title: true }
      })
    : [];
  const diagnosticMap = new Map(diagnosticRows.map((row) => [row.id, row.title]));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total > 0 && page > totalPages) {
    redirect(pageHref(totalPages, type, query));
  }
  const safePage = Math.min(page, totalPages);
  const visiblePages = Array.from(
    new Set([1, safePage - 1, safePage, safePage + 1, totalPages])
  ).filter((value) => value >= 1 && value <= totalPages);

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Logs & tracking</div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Parcours utilisateur</h1>
          <p className="text-slate-600 mt-2">Événements détaillés, provenance et contexte technique.</p>
        </div>
        <form className="flex flex-col sm:flex-row gap-3" method="get">
          <div className="relative min-w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Page, pays, session, navigateur..."
              className="glass-input w-full !py-2.5 !pl-10 text-sm"
            />
          </div>
          <select name="type" defaultValue={type} className="glass-input !py-2.5 text-sm min-w-52">
            {EVENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button className="glass-button !px-5 !py-2.5 text-sm" type="submit">Filtrer</button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard icon={Activity} label="Événements trouvés" value={total.toLocaleString('fr-FR')} />
        <SummaryCard icon={UsersRound} label="Sessions anonymes" value={uniqueSessions.length.toLocaleString('fr-FR')} />
        <SummaryCard icon={Clock3} label="Durée moyenne" value={formatDuration(averageDuration._avg.durationMs || null)} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-semibold">Date et événement</th>
                <th className="px-5 py-4 font-semibold">Page et action</th>
                <th className="px-5 py-4 font-semibold">Visiteur</th>
                <th className="px-5 py-4 font-semibold">Acquisition</th>
                <th className="px-5 py-4 font-semibold">Localisation</th>
                <th className="px-5 py-4 font-semibold">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const config = EVENT_LABELS[log.eventName] || {
                  label: log.eventName,
                  tone: 'bg-slate-100 text-slate-700',
                  icon: Activity
                };
                const EventIcon = config.icon;
                const details = getEventDetails(log.eventName, log.metadata);
                const diagnosticTitle = log.diagnosticId
                  ? diagnosticMap.get(log.diagnosticId)
                  : null;
                return (
                  <tr key={log.id} className="align-top hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 w-56">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${config.tone}`}>
                        <EventIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      <div className="mt-2 text-xs text-slate-500">{log.createdAt.toLocaleString('fr-FR')}</div>
                    </td>
                    <td className="px-5 py-4 max-w-80">
                      <div className="font-semibold text-slate-900 truncate" title={log.path}>{diagnosticTitle || log.path}</div>
                      {diagnosticTitle && <div className="text-xs text-slate-400 mt-1">{log.path}</div>}
                      {details && <div className="mt-1.5 text-xs text-slate-600">{details}</div>}
                      <div className="mt-1.5 text-xs text-slate-400">{formatDuration(log.durationMs)}</div>
                    </td>
                    <td className="px-5 py-4 w-56">
                      <div className="flex items-center gap-2 text-slate-700">
                        <UserRound className="w-4 h-4 text-slate-400" />
                        <span className="font-medium truncate">{log.user?.name || log.user?.email || 'Visiteur anonyme'}</span>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-400 truncate" title={log.sessionId || ''}>{log.sessionId ? `Session ${log.sessionId.slice(0, 8)}` : 'Session inconnue'}</div>
                      <div className="mt-1 text-xs text-slate-400">IP {log.ip || 'non disponible'}</div>
                    </td>
                    <td className="px-5 py-4 max-w-56">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Flag className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{log.utmSource || (log.referrer ? 'Site référent' : 'Accès direct')}</span>
                      </div>
                      {log.utmCampaign && <div className="mt-1 text-xs text-slate-500 truncate">Campagne : {log.utmCampaign}</div>}
                      {log.referrer && <div className="mt-1 text-xs text-slate-400 truncate" title={log.referrer}>{log.referrer}</div>}
                    </td>
                    <td className="px-5 py-4 w-44">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {[log.city, log.country].filter(Boolean).join(', ') || 'Non localisé'}
                      </div>
                      {log.timezone && <div className="mt-1.5 text-xs text-slate-400">{log.timezone}</div>}
                    </td>
                    <td className="px-5 py-4 w-52">
                      <div className="flex items-center gap-2 text-slate-700">
                        {log.deviceType === 'Mobile' ? <Smartphone className="w-4 h-4 text-slate-400" /> : <Monitor className="w-4 h-4 text-slate-400" />}
                        {log.deviceType || 'Appareil inconnu'}
                      </div>
                      <div className="mt-1.5 text-xs text-slate-500">{[log.browser, log.os].filter(Boolean).join(' · ') || log.deviceName || 'Navigateur inconnu'}</div>
                      {log.screen && <div className="mt-1 text-xs text-slate-400">Écran {log.screen}</div>}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr><td className="px-6 py-12 text-center text-slate-500" colSpan={6}>Aucun événement ne correspond aux filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 bg-slate-50">
          <p className="text-sm text-slate-500">
            {total === 0 ? '0 événement' : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, total)} sur ${total}`}
          </p>
          <nav className="flex items-center gap-1" aria-label="Pagination des logs">
            <PaginationLink href={pageHref(Math.max(1, safePage - 1), type, query)} disabled={safePage <= 1} label="Précédent"><ChevronLeft className="w-4 h-4" /></PaginationLink>
            {visiblePages.map((pageNumber, index) => (
              <span key={pageNumber} className="contents">
                {index > 0 && pageNumber - visiblePages[index - 1] > 1 && <span className="px-2 text-slate-400">…</span>}
                <Link href={pageHref(pageNumber, type, query)} className={`min-w-9 h-9 rounded-md inline-flex items-center justify-center text-sm font-semibold ${pageNumber === safePage ? 'bg-[#eb5f2a] text-white' : 'text-slate-600 hover:bg-slate-200'}`}>{pageNumber}</Link>
              </span>
            ))}
            <PaginationLink href={pageHref(Math.min(totalPages, safePage + 1), type, query)} disabled={safePage >= totalPages} label="Suivant"><ChevronRight className="w-4 h-4" /></PaginationLink>
          </nav>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="w-5 h-5 text-[#eb5f2a]" /></div>
      <div><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-bold text-slate-900 mt-0.5">{value}</div></div>
    </div>
  );
}

function PaginationLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled) return <span aria-label={label} className="w-9 h-9 rounded-md inline-flex items-center justify-center text-slate-300">{children}</span>;
  return <Link href={href} aria-label={label} className="w-9 h-9 rounded-md inline-flex items-center justify-center text-slate-600 hover:bg-slate-200">{children}</Link>;
}
