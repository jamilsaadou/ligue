'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Gauge,
  MonitorSmartphone,
  MousePointerClick,
  Route,
  ShieldCheck,
  Smartphone,
  UserRoundX,
  UsersRound
} from 'lucide-react';

export type AnalyticsDashboardData = {
  days: number;
  diagnosticId: string;
  diagnostics: Array<{ id: string; title: string }>;
  kpis: {
    starts: number;
    completions: number;
    completionRate: number;
    abandonmentRate: number;
    uniqueVisitors: number;
    pageViews: number;
    averageDurationMs: number;
    averageScorePercent: number;
    anonymousRate: number;
  };
  funnel: Array<{ label: string; value: number; color: string }>;
  timeline: Array<{
    key: string;
    label: string;
    starts: number;
    completions: number;
  }>;
  levels: Array<{
    key: string;
    label: string;
    value: number;
    color: string;
  }>;
  topPages: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>;
  sources: Array<{ label: string; value: number }>;
  performance: Array<{
    id: string;
    title: string;
    starts: number;
    completions: number;
    completionRate: number;
    averageScorePercent: number;
    danger: number;
  }>;
  recentResults: Array<{
    id: string;
    diagnostic: string;
    level: string;
    scorePercent: number;
    durationMs: number | null;
    anonymous: boolean;
    createdAt: string;
  }>;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);

const formatDuration = (durationMs: number) => {
  if (!durationMs) return '0 min';
  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.round((durationMs % 60_000) / 1000);
  return minutes ? `${minutes} min ${seconds}s` : `${seconds}s`;
};

const eventCardAnimation = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 }
};

export default function AnalyticsDashboard({ data }: { data: AnalyticsDashboardData }) {
  const router = useRouter();
  const maxTimeline = Math.max(
    1,
    ...data.timeline.flatMap((entry) => [entry.starts, entry.completions])
  );
  const totalLevels = Math.max(1, data.levels.reduce((sum, item) => sum + item.value, 0));
  const levelStops = data.levels.reduce(
    (acc, item) => {
      const start = acc.cursor;
      const end = start + (item.value / totalLevels) * 100;
      acc.parts.push(`${item.color} ${start}% ${end}%`);
      acc.cursor = end;
      return acc;
    },
    { parts: [] as string[], cursor: 0 }
  );

  const navigateWithFilters = (next: { days?: number; diagnosticId?: string }) => {
    const params = new URLSearchParams();
    params.set('days', String(next.days ?? data.days));
    const diagnosticId = next.diagnosticId ?? data.diagnosticId;
    if (diagnosticId && diagnosticId !== 'all') params.set('diagnostic', diagnosticId);
    router.push(`/admin/statistiques?${params.toString()}`);
  };

  const kpiCards = [
    {
      label: 'Diagnostics commencés',
      value: formatNumber(data.kpis.starts),
      hint: `${formatNumber(data.kpis.uniqueVisitors)} visiteurs uniques`,
      icon: MousePointerClick,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Diagnostics terminés',
      value: formatNumber(data.kpis.completions),
      hint: `${data.kpis.completionRate.toFixed(1)}% de complétion`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      label: "Taux d'abandon",
      value: `${data.kpis.abandonmentRate.toFixed(1)}%`,
      hint: 'Tentatives non terminées',
      icon: UserRoundX,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      label: 'Durée moyenne',
      value: formatDuration(data.kpis.averageDurationMs),
      hint: 'Pour terminer un diagnostic',
      icon: Clock3,
      color: 'text-violet-600 bg-violet-50'
    },
    {
      label: 'Score moyen',
      value: `${data.kpis.averageScorePercent.toFixed(1)}%`,
      hint: 'Score normalisé sur 100',
      icon: Gauge,
      color: 'text-[#eb5f2a] bg-orange-50'
    },
    {
      label: 'Résultats anonymes',
      value: `${data.kpis.anonymousRate.toFixed(1)}%`,
      hint: `${formatNumber(data.kpis.pageViews)} pages vues`,
      icon: ShieldCheck,
      color: 'text-slate-600 bg-slate-100'
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      <motion.section
        className="relative overflow-hidden rounded-lg bg-slate-900 px-7 py-8 text-white md:px-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-orange-300">
              <Activity className="w-4 h-4" />
              Analytics diagnostic
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold">Indicateurs de performance</h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-300">
              Démarrages, résultats, abandons et acquisition, y compris pour les visiteurs sans compte.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex rounded-lg bg-white/10 p-1" aria-label="Période d'analyse">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => navigateWithFilters({ days })}
                  className={`min-w-16 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    data.days === days
                      ? 'bg-white text-slate-900'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {days} j
                </button>
              ))}
            </div>
            <select
              value={data.diagnosticId}
              onChange={(event) => navigateWithFilters({ diagnosticId: event.target.value })}
              className="min-w-56 rounded-lg border border-white/15 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400"
            >
              <option value="all">Tous les diagnostics</option>
              {data.diagnostics.map((diagnostic) => (
                <option key={diagnostic.id} value={diagnostic.id}>
                  {diagnostic.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="absolute -right-10 -top-12 h-52 w-52 rounded-full border-[32px] border-orange-500/15" />
      </motion.section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            {...eventCardAnimation}
            transition={{ delay: index * 0.06 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400">{card.hint}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
        <motion.div className="rounded-lg border border-slate-200 bg-white p-6 md:p-7 shadow-sm" {...eventCardAnimation}>
          <div className="flex items-center justify-between gap-4 mb-7">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Évolution des diagnostics</h2>
              <p className="text-sm text-slate-500 mt-1">Commencés et terminés sur la période</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-2 h-64 min-w-[680px] border-b border-slate-200">
              {data.timeline.map((entry, index) => (
                <div key={entry.key} className="flex-1 h-full flex flex-col justify-end items-center gap-2 min-w-7">
                  <div className="w-full flex items-end justify-center gap-1 h-[205px]">
                    <motion.div
                      className="w-[42%] max-w-5 rounded-t bg-blue-500"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(2, (entry.starts / maxTimeline) * 100)}%` }}
                      transition={{ duration: 0.65, delay: index * 0.025 }}
                      title={`${entry.starts} commencés`}
                    />
                    <motion.div
                      className="w-[42%] max-w-5 rounded-t bg-emerald-500"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(2, (entry.completions / maxTimeline) * 100)}%` }}
                      transition={{ duration: 0.65, delay: 0.08 + index * 0.025 }}
                      title={`${entry.completions} terminés`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Commencés</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Terminés</span>
          </div>
        </motion.div>

        <motion.div className="rounded-lg border border-slate-200 bg-white p-6 md:p-7 shadow-sm" {...eventCardAnimation} transition={{ delay: 0.08 }}>
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Entonnoir</h2>
              <p className="text-sm text-slate-500 mt-1">Du trafic au résultat</p>
            </div>
            <Route className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-5">
            {data.funnel.map((item, index) => {
              const maxValue = Math.max(1, data.funnel[0]?.value || 1);
              const width = Math.max(8, (item.value / maxValue) * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{formatNumber(item.value)}</span>
                  </div>
                  <div className="h-9 rounded-md bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-md"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.7, delay: index * 0.12 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" {...eventCardAnimation}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Niveaux de résultat</h2>
            <AlertTriangle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-center gap-7">
            <div
              className="relative h-36 w-36 flex-shrink-0 rounded-full"
              style={{ background: `conic-gradient(${levelStops.parts.join(', ') || '#e2e8f0 0 100%'})` }}
            >
              <div className="absolute inset-5 rounded-full bg-white flex flex-col items-center justify-center">
                <strong className="text-2xl text-slate-900">{formatNumber(totalLevels === 1 && data.levels.every((item) => item.value === 0) ? 0 : totalLevels)}</strong>
                <span className="text-[11px] text-slate-400">résultats</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {data.levels.map((level) => (
                <div key={level.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: level.color }} />
                    {level.label}
                  </span>
                  <strong className="text-slate-900">{level.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <ListCard title="Sources d'acquisition" icon={Eye} items={data.sources} empty="Aucune source détectée" />
        <ListCard title="Appareils" icon={MonitorSmartphone} items={data.devices} empty="Aucun appareil détecté" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <motion.div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden" {...eventCardAnimation}>
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Performance par diagnostic</h2>
              <p className="text-sm text-slate-500 mt-1">Comparaison des indicateurs clés</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Diagnostic</th>
                  <th className="px-4 py-4 font-semibold">Commencés</th>
                  <th className="px-4 py-4 font-semibold">Terminés</th>
                  <th className="px-4 py-4 font-semibold">Complétion</th>
                  <th className="px-4 py-4 font-semibold">Score moyen</th>
                  <th className="px-4 py-4 font-semibold">Danger</th>
                </tr>
              </thead>
              <tbody>
                {data.performance.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-64 truncate">{row.title}</td>
                    <td className="px-4 py-4 text-slate-600">{row.starts}</td>
                    <td className="px-4 py-4 text-slate-600">{row.completions}</td>
                    <td className="px-4 py-4"><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{row.completionRate.toFixed(1)}%</span></td>
                    <td className="px-4 py-4 text-slate-600">{row.averageScorePercent.toFixed(1)}%</td>
                    <td className="px-4 py-4 text-red-600 font-semibold">{row.danger}</td>
                  </tr>
                ))}
                {data.performance.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Aucun diagnostic disponible.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <ListCard title="Pages les plus consultées" icon={Eye} items={data.topPages} empty="Aucune page consultée" />
      </section>

      <motion.section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden" {...eventCardAnimation}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Derniers résultats</h2>
            <p className="text-sm text-slate-500 mt-1">Informations agrégées, sans afficher les réponses</p>
          </div>
          <UsersRound className="w-5 h-5 text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100">
          {data.recentResults.map((result) => (
            <div key={result.id} className="grid grid-cols-2 md:grid-cols-[1.4fr_.7fr_.7fr_.8fr_.7fr] gap-4 px-6 py-4 items-center text-sm">
              <div className="font-semibold text-slate-900 truncate">{result.diagnostic}</div>
              <div><LevelBadge level={result.level} /></div>
              <div className="text-slate-600">{result.scorePercent.toFixed(1)}%</div>
              <div className="text-slate-500">{result.durationMs ? formatDuration(result.durationMs) : 'Durée inconnue'}</div>
              <div className="text-right text-xs text-slate-400">{new Date(result.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          ))}
          {data.recentResults.length === 0 && <p className="px-6 py-8 text-sm text-slate-500">Aucun résultat sur cette période.</p>}
        </div>
      </motion.section>
    </div>
  );
}

function ListCard({
  title,
  icon: Icon,
  items,
  empty
}: {
  title: string;
  icon: typeof Smartphone;
  items: Array<{ label: string; value: number }>;
  empty: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <motion.div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" {...eventCardAnimation}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div className="space-y-4">
        {items.slice(0, 5).map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
              <span className="truncate text-slate-600" title={item.label}>{item.label}</span>
              <strong className="text-slate-900">{formatNumber(item.value)}</strong>
            </div>
            <div className="h-1.5 rounded bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded bg-[#eb5f2a]"
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">{empty}</p>}
      </div>
    </motion.div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const styles =
    level === 'danger'
      ? 'bg-red-50 text-red-700'
      : level === 'warning'
        ? 'bg-orange-50 text-orange-700'
        : 'bg-slate-100 text-slate-700';
  const label = level === 'danger' ? 'Danger' : level === 'warning' ? 'Vigilance' : 'Sain';
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
}
