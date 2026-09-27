"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  Globe2,
  Info,
  LineChart,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  percent,
  variation,
  type AnalyticsDashboardData,
  type ChartItem,
  type TimelinePoint,
} from "@/lib/analytics-metrics";

export type { AnalyticsDashboardData } from "@/lib/analytics-metrics";
const count = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
const ratio = (value: number | null) =>
  value === null
    ? "—"
    : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)} %`;
const date = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const duration = (value: number | null) => {
  if (value === null) return "—";
  const seconds = Math.round(value / 1000);
  return seconds >= 60
    ? `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`
    : `${seconds} s`;
};
const panelClass =
  "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${panelClass} ${className}`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {subtitle}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function SectionHeading({
  id,
  index,
  title,
  text,
  badge,
}: {
  id: string;
  index: string;
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-6 flex flex-wrap items-end justify-between gap-3"
    >
      <div>
        <div className="mb-1 text-[11px] font-bold uppercase tracking-[.16em] text-[#b7461c]">
          {index}
        </div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
      {badge && (
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          {badge}
        </span>
      )}
    </div>
  );
}
function Empty({
  text = "Aucune donnée sur cette période.",
}: {
  text?: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
      <BarChart3 className="h-7 w-7 text-slate-300" aria-hidden="true" />
      {text}
    </div>
  );
}
function Delta({ current, previous }: { current: number; previous: number }) {
  const value = variation(current, previous);
  if (value === null)
    return (
      <span className="text-xs text-slate-500">
        {current ? "Sans base de comparaison" : "Aucune activité"}
      </span>
    );
  const Icon = value < 0 ? ArrowDown : ArrowUp;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
        {value !== 0 && <Icon className="h-3 w-3" aria-hidden="true" />}
        {ratio(Math.abs(value))}
      </span>
      vs période précédente
    </span>
  );
}
function Metric({
  label,
  value,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div className={panelClass}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <Icon className="h-5 w-5 shrink-0 text-[#c64e21]" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>
      {children && (
        <div className="mt-4 border-t border-slate-100 pt-3">{children}</div>
      )}
    </div>
  );
}
function Bars({
  items,
  total,
  color = "#f15b24",
  empty,
}: {
  items: ChartItem[];
  total: number;
  color?: string;
  empty?: string;
}) {
  if (!items.some((item) => item.value > 0)) return <Empty text={empty} />;
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <div className="mb-2 flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 break-words text-slate-600">
              {item.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">
              {count(item.value)}{" "}
              <span className="ml-1 text-xs font-normal text-slate-500">
                {ratio(percent(item.value, total))}
              </span>
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: item.color || color,
                width: `${Math.min(100, percent(item.value, total) || 0)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
function Ring({
  items,
  total,
  label,
}: {
  items: ChartItem[];
  total: number;
  label: string;
}) {
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += percent(item.value, total) || 0;
    return `${item.color || "#94a3b8"} ${start}% ${cursor}%`;
  });
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full"
        role="img"
        aria-label={`${count(total)} ${label}`}
        style={{
          background: total ? `conic-gradient(${stops.join(",")})` : "#e2e8f0",
        }}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
          <strong className="text-3xl font-bold text-slate-900">
            {count(total)}
          </strong>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      </div>
      <ul className="w-full space-y-3">
        {items
          .filter((item) => item.value > 0 || total === 0)
          .map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
              <span className="shrink-0 text-right">
                <strong className="text-slate-900">{count(item.value)}</strong>
                <span className="ml-2 text-xs text-slate-500">
                  {ratio(percent(item.value, total))}
                </span>
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

function TimelineChart({
  points,
  weekly,
}: {
  points: TimelinePoint[];
  weekly: boolean;
}) {
  const id = useId();
  const [mode, setMode] = useState<"line" | "bar">("line");
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(
    1,
    ...points.flatMap((point) => [point.starts, point.completions]),
  );
  const ceiling = Math.max(4, Math.ceil(max / 4) * 4);
  const left = 40,
    top = 18,
    width = 660,
    height = 190;
  const x = (index: number) =>
    left + ((index + 0.5) * width) / Math.max(1, points.length);
  const y = (value: number) => top + height - (value / ceiling) * height;
  const line = (key: "starts" | "completions") =>
    points
      .map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point[key])}`)
      .join(" ");
  const selectedPoint = selected === null ? null : points[selected];
  return (
    <Panel
      title="Évolution des diagnostics"
      subtitle={`${weekly ? "Par semaine" : "Par jour"} · démarrages et résultats reçus, dates UTC`}
      action={
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(["line", "bar"] as const).map((value) => {
            const Icon = value === "line" ? LineChart : BarChart3;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-label={
                  value === "line"
                    ? "Afficher les courbes"
                    : "Afficher les barres"
                }
                aria-pressed={mode === value}
                className={`rounded-md p-2 ${mode === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      }
    >
      {points.some((p) => p.starts || p.completions) ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-[#f15b24]" />
              Commencés
            </span>
            <span className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-teal-600" />
              Résultats reçus
            </span>
          </div>
          <div
            className="overflow-x-auto pb-2"
            tabIndex={0}
            role="region"
            aria-label="Graphique temporel, défilement horizontal"
          >
            <svg
              viewBox="0 0 720 250"
              className="w-full min-w-[560px] overflow-visible"
              role="img"
              aria-labelledby={`${id}-title`}
            >
              <title id={`${id}-title`}>
                Évolution des démarrages et résultats. Valeurs détaillées
                disponibles sous le graphique.
              </title>
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line
                    x1={left}
                    x2={left + width}
                    y1={y((ceiling * i) / 4)}
                    y2={y((ceiling * i) / 4)}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={left - 8}
                    y={y((ceiling * i) / 4) + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#64748b"
                  >
                    {count((ceiling * i) / 4)}
                  </text>
                </g>
              ))}
              {mode === "line" && (
                <>
                  <path
                    d={`${line("starts")} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`}
                    fill="#f15b24"
                    opacity=".07"
                  />
                  <path
                    d={line("starts")}
                    fill="none"
                    stroke="#f15b24"
                    strokeWidth="2.5"
                  />
                  <path
                    d={line("completions")}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="2.5"
                  />
                </>
              )}
              {points.map((point, index) => (
                <g key={point.key}>
                  {mode === "bar" && (
                    <>
                      <rect
                        x={x(index) - (width / points.length) * 0.32}
                        y={y(point.starts)}
                        width={(width / points.length) * 0.28}
                        height={(height * point.starts) / ceiling}
                        rx="2"
                        fill="#f15b24"
                      />
                      <rect
                        x={x(index) + (width / points.length) * 0.04}
                        y={y(point.completions)}
                        width={(width / points.length) * 0.28}
                        height={(height * point.completions) / ceiling}
                        rx="2"
                        fill="#0d9488"
                      />
                    </>
                  )}
                  {(index === 0 ||
                    index === points.length - 1 ||
                    index % Math.ceil(points.length / 5) === 0) && (
                    <text
                      x={x(index)}
                      y="234"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                    >
                      {point.label}
                    </text>
                  )}
                  {selected === index && (
                    <line
                      x1={x(index)}
                      x2={x(index)}
                      y1={top}
                      y2={y(0)}
                      stroke="#94a3b8"
                      strokeDasharray="3 3"
                    />
                  )}
                  <rect
                    x={x(index) - width / points.length / 2}
                    y={top}
                    width={width / points.length}
                    height={height}
                    fill="transparent"
                    tabIndex={0}
                    role="button"
                    aria-label={`${point.label} : ${point.starts} commencés, ${point.completions} résultats`}
                    onMouseEnter={() => setSelected(index)}
                    onFocus={() => setSelected(index)}
                    onClick={() => setSelected(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(index);
                      }
                    }}
                    className="cursor-pointer focus:outline focus:outline-2 focus:outline-slate-500"
                  >
                    <title>
                      {`${point.label} : ${point.starts} commencés · ${point.completions} résultats`}
                    </title>
                  </rect>
                </g>
              ))}
              </svg>
            </div>
          <div
            aria-live="polite"
            className="mt-2 min-h-10 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
          >
            {selectedPoint
              ? `${selectedPoint.label} : ${count(selectedPoint.starts)} commencés · ${count(selectedPoint.completions)} résultats reçus`
              : "Survolez ou sélectionnez une période pour afficher ses valeurs."}
          </div>
        </>
      ) : (
        <Empty text="Aucun démarrage ni résultat sur cette période." />
      )}
      <details className="mt-4 text-xs text-slate-600">
        <summary className="cursor-pointer font-semibold">
          Voir les données du graphique
        </summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <caption className="sr-only">
              Volumes de diagnostics par période
            </caption>
            <thead>
              <tr>
                <th className="p-2">Période UTC</th>
                <th>Commencés</th>
                <th>Résultats</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.key} className="border-t border-slate-100">
                  <th className="p-2 font-normal">{date(point.key)}</th>
                  <td>{count(point.starts)}</td>
                  <td>{count(point.completions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Panel>
  );
}

function Heatmap({
  activity,
}: {
  activity: AnalyticsDashboardData["activity"];
}) {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const values = new Map(
    activity.map((item) => [`${item.day}-${item.hour}`, item.value]),
  );
  const max = Math.max(1, ...activity.map((item) => item.value));
  const peak = [...activity].sort((a, b) => b.value - a.value)[0];
  return (
    <Panel
      title="Quand le site est-il consulté ?"
      subtitle="Pages vues par jour de la semaine et heure · UTC · ensemble du site"
    >
      {peak ? (
        <>
          <div
            className="overflow-x-auto pb-2"
            tabIndex={0}
            role="region"
            aria-label="Carte d’activité, défilement horizontal"
          >
            <div className="min-w-[480px]">
              <div className="mb-2 ml-9 grid grid-cols-24 text-[10px] text-slate-400">
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h}>{h % 6 === 0 || h === 23 ? `${h}h` : ""}</span>
                ))}
              </div>
              {days.map((day, d) => (
                <div key={day} className="mb-1 flex items-center gap-2">
                  <span className="w-7 shrink-0 text-[11px] text-slate-500">
                    {day}
                  </span>
                  <div className="grid flex-1 grid-cols-24 gap-1">
                    {Array.from({ length: 24 }, (_, h) => {
                      const value = values.get(`${d}-${h}`) || 0;
                      return (
                        <div
                          key={h}
                          className="h-5 rounded-sm"
                          style={{
                            background: value
                              ? `rgba(234,88,12,${0.15 + (0.85 * value) / max})`
                              : "#f1f5f9",
                          }}
                          title={`${day} ${h}h UTC : ${count(value)} pages vues`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-slate-500">
            <span>
              Créneau le plus actif :{" "}
              <strong className="text-slate-700">
                {days[peak.day]} · {peak.hour}h UTC
              </strong>{" "}
              ({count(peak.value)} vues)
            </span>
            <span>Couleur plus foncée = plus de vues</span>
          </div>
          <details className="mt-3 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold">
              Consulter les valeurs par créneau
            </summary>
            <div className="mt-3 max-h-52 overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Heure UTC</th>
                    <th>Vues</th>
                  </tr>
                </thead>
                <tbody>
                  {[...activity]
                    .sort((a, b) => a.day - b.day || a.hour - b.hour)
                    .map((item) => (
                      <tr
                        key={`${item.day}-${item.hour}`}
                        className="border-t border-slate-100"
                      >
                        <td className="py-2">{days[item.day]}</td>
                        <td>{item.hour}h</td>
                        <td>{count(item.value)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <Empty text="Aucune consultation enregistrée." />
      )}
    </Panel>
  );
}

function exportData(data: AnalyticsDashboardData) {
  const rows: Array<Array<string | number>> = [
    ["Statistiques ALERTE VIOLENCE", "Export agrégé"],
    ["Du (UTC)", data.period.from],
    ["Au (UTC)", data.period.to],
    [
      "Diagnostic",
      data.diagnostics.find((item) => item.id === data.diagnosticId)?.title ||
        "Tous les diagnostics",
    ],
    ["Indicateur", "Valeur"],
    ["Démarrages", data.kpis.starts],
    ["Résultats reçus", data.kpis.completions],
    ["Tentatives de la période terminées", data.kpis.completedStarts],
    ["Tentatives non terminées", data.kpis.unfinishedStarts],
    ["Complétion (%)", data.kpis.completionRate ?? "Non disponible"],
    ["Pages vues (site entier)", data.kpis.pageViews],
    ["Navigateurs identifiés (site entier)", data.kpis.uniqueVisitors],
    [],
    ["Période UTC", "Démarrages", "Résultats"],
    ...data.timeline.map((item) => [item.key, item.starts, item.completions]),
    [],
    ["Niveau", "Résultats"],
    ...data.levels.map((item) => [item.label, item.value]),
    [],
    [
      "Diagnostic",
      "Démarrages",
      "Résultats",
      "Complétion (%)",
      "Score moyen (%)",
    ],
    ...data.performance.map((item) => [
      item.title,
      item.starts,
      item.completions,
      item.completionRate ?? "Non disponible",
      item.averageScorePercent ?? "Non disponible",
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value);
          return `"${(/^[=+\-@\t\r\n]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
        })
        .join(";"),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `statistiques-${data.days}j-${data.period.to.slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AnalyticsDashboard({
  data,
}: {
  data: AnalyticsDashboardData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [performanceSort, setPerformanceSort] = useState<
    "completions" | "starts" | "completionRate"
  >("completions");
  const k = data.kpis;
  const danger = data.levels.find((item) => item.key === "danger")?.value || 0;
  const navigate = (next: { days?: number; diagnosticId?: string }) => {
    const params = new URLSearchParams({
      days: String(next.days ?? data.days),
    });
    const id = next.diagnosticId ?? data.diagnosticId;
    if (id !== "all") params.set("diagnostic", id);
    startTransition(() =>
      router.push(`/admin/statistiques?${params}`, { scroll: false }),
    );
  };
  const performance = [...data.performance].sort(
    (a, b) => (b[performanceSort] ?? -1) - (a[performanceSort] ?? -1),
  );
  return (
    <div className="space-y-8 pb-8" aria-busy={pending}>
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#b7461c]">
              <Activity className="h-4 w-4" />
              Pilotage & suivi
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Statistiques
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Comprendre les usages, suivre les diagnostics et repérer les
              points d’attention.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => router.refresh())}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${pending ? "animate-spin" : ""}`}
              />
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => exportData(data)}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-5">
          <fieldset disabled={pending}>
            <legend className="mb-2 text-xs font-medium text-slate-500">
              Période
            </legend>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={data.days === days}
                  onClick={() => navigate({ days })}
                  className={`rounded-md px-3 py-2 text-sm font-semibold sm:px-4 ${days === data.days ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  {days} jours
                </button>
              ))}
            </div>
          </fieldset>
          <label className="w-full text-xs font-medium text-slate-500 sm:w-72">
            Diagnostic
            <select
              disabled={pending}
              aria-label="Diagnostic"
              value={data.diagnosticId}
              onChange={(e) => navigate({ diagnosticId: e.target.value })}
              className="mt-2 block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            >
              <option value="all">Tous les diagnostics</option>
              {data.diagnostics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <div className="text-xs leading-5 text-slate-500">
            <p>
              {date(data.period.from)} — {date(data.period.to)} · UTC
            </p>
            <p>
              Relevé à{" "}
              {new Date(data.period.to).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              })}{" "}
              UTC
            </p>
          </div>
        </div>
        <p role="status" className="mt-3 text-xs text-slate-500">
          {pending
            ? "Mise à jour des indicateurs…"
            : "Le filtre diagnostic s’applique au parcours et aux résultats. La fréquentation concerne tout le site."}
        </p>
      </header>
      <nav
        aria-label="Sections des statistiques"
        className="flex flex-wrap gap-2"
      >
        {[
          ["synthese", "Vue d’ensemble"],
          ["parcours", "Parcours"],
          ["resultats", "Résultats"],
          ["frequentation", "Fréquentation"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-orange-300 hover:text-orange-700"
          >
            {label}
          </a>
        ))}
      </nav>

      <SectionHeading
        id="synthese"
        index="01 / Vue d’ensemble"
        title="L’essentiel en un regard"
        text="Les indicateurs du diagnostic sélectionné, sur la période choisie."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Diagnostics commencés"
          value={count(k.starts)}
          hint="Tentatives démarrées pendant la période"
          icon={MousePointerClick}
        >
          <Delta current={k.starts} previous={data.previous.starts} />
        </Metric>
        <Metric
          label="Résultats reçus"
          value={count(k.completions)}
          hint="Soumissions enregistrées pendant la période"
          icon={CheckCircle2}
        >
          <Delta current={k.completions} previous={data.previous.completions} />
        </Metric>
        <Metric
          label="Taux de complétion"
          value={ratio(k.completionRate)}
          hint={`${count(k.completedStarts)} terminés parmi ${count(k.starts)} démarrages`}
          icon={Activity}
        >
          <span className="text-xs text-slate-500">
            {count(k.unfinishedStarts)} tentative(s) non terminée(s)
          </span>
        </Metric>
        <Metric
          label="Temps médian"
          value={duration(k.medianDurationMs)}
          hint={`${count(k.durationSamples)} résultat(s) avec une durée mesurée`}
          icon={Clock3}
        >
          <span className="text-xs text-slate-500">
            Moyenne : {duration(k.averageDurationMs)}
          </span>
        </Metric>
      </div>
      <aside className="grid gap-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-5 lg:grid-cols-[150px_1fr_1fr_1fr]">
        <div className="flex items-start gap-2 text-sm font-bold text-orange-900">
          <Info className="h-5 w-5 shrink-0" />À retenir
        </div>
        <p className="text-sm leading-relaxed text-slate-700">
          <strong>{count(danger)} résultat(s) « Danger »</strong>
          <br />
          <span className="text-xs text-slate-500">
            {ratio(percent(danger, k.completions))} des résultats reçus.
            Indicateur collectif, sans identification des personnes.
          </span>
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          <strong>
            {count(k.unfinishedStarts)} tentative(s) non terminée(s)
          </strong>
          <br />
          <span className="text-xs text-slate-500">
            Elles peuvent être en cours ou interrompues ; ce nombre n’est pas un
            taux d’abandon définitif.
          </span>
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          <strong>
            {ratio(percent(k.withoutAccount, k.completions))} sans compte
            associé
          </strong>
          <br />
          <span className="text-xs text-slate-500">
            {count(k.withoutAccount)} résultat(s). L’absence de compte ne
            garantit pas l’anonymat.
          </span>
        </p>
      </aside>

      <SectionHeading
        id="parcours"
        index="02 / Parcours"
        title="Du démarrage au résultat"
        text="Évolution de l’activité et suivi des tentatives commencées sur la période."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <TimelineChart points={data.timeline} weekly={data.days > 30} />
        <Panel
          title="Complétion des tentatives"
          subtitle="Même groupe de départ : les tentatives commencées dans la période"
        >
          <Bars
            total={k.starts}
            items={[
              { label: "Commencées", value: k.starts, color: "#f15b24" },
              {
                label: "Avec un résultat",
                value: k.completedStarts,
                color: "#0d9488",
              },
              {
                label: "Non terminées",
                value: k.unfinishedStarts,
                color: "#94a3b8",
              },
            ]}
          />
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
            Les résultats reçus peuvent provenir de tentatives plus anciennes.
            Ils ne servent donc pas directement au calcul du taux de complétion.
          </p>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Temps nécessaire pour terminer"
          subtitle="Répartition des durées mesurées ; durées absentes ou nulles exclues"
        >
          <Bars
            items={data.durations}
            total={k.durationSamples}
            color="#6366f1"
          />
          <p className="mt-5 text-xs text-slate-500">
            {count(k.completions - k.durationSamples)} résultat(s) sans durée
            exploitable.
          </p>
        </Panel>
        <Panel
          title="Pour soi ou pour un proche"
          subtitle="Répartition des résultats par mode choisi"
        >
          <Ring items={data.modes} total={k.completions} label="résultats" />
        </Panel>
      </div>

      <SectionHeading
        id="resultats"
        index="03 / Résultats"
        title="Comprendre les résultats recueillis"
        text="Répartition des niveaux et comparaison des questionnaires."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Panel
          title="Niveaux de résultat"
          subtitle="Part de chaque niveau parmi les soumissions reçues"
        >
          <Ring items={data.levels} total={k.completions} label="résultats" />
          <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Score moyen normalisé</span>
            <strong className="text-slate-900">
              {ratio(k.averageScorePercent)}
            </strong>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Calculé sur {count(k.validScores)} score(s) valide(s). Ce score
            n’est pas une mesure de prévalence des violences.
          </p>
        </Panel>
        <Panel
          title="Performance par diagnostic"
          subtitle="Résultats reçus et complétion du groupe de tentatives de la période"
          action={
            <label className="text-xs text-slate-500">
              Trier par
              <select
                aria-label="Trier par"
                value={performanceSort}
                onChange={(e) =>
                  setPerformanceSort(e.target.value as typeof performanceSort)
                }
                className="ml-2 rounded-md border border-slate-200 bg-white p-1.5 text-slate-700"
              >
                <option value="completions">Résultats</option>
                <option value="starts">Démarrages</option>
                <option value="completionRate">Complétion</option>
              </select>
            </label>
          }
        >
          {performance.length ? (
            <div
              className="overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-label="Comparaison des diagnostics"
            >
              <table className="w-full min-w-[530px] text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    {[
                      "Diagnostic",
                      "Départs",
                      "Résultats",
                      "Complétion",
                      "Danger",
                    ].map((label) => (
                      <th key={label} className="px-2 pb-3 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {performance.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <th className="max-w-56 px-2 py-4 font-semibold text-slate-800">
                        <span className="block break-words">{item.title}</span>
                        <span className="mt-1 block font-normal text-slate-500">
                          Score moyen : {ratio(item.averageScorePercent)}
                        </span>
                      </th>
                      <td className="px-2">{count(item.starts)}</td>
                      <td className="px-2">{count(item.completions)}</td>
                      <td className="px-2">
                        <span className="font-semibold text-teal-700">
                          {ratio(item.completionRate)}
                        </span>
                        <div className="mt-2 h-1 w-16 rounded bg-slate-100">
                          <div
                            className="h-full rounded bg-teal-600"
                            style={{ width: `${item.completionRate || 0}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-2 font-semibold text-rose-700">
                        {count(item.danger)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="Aucun diagnostic disponible." />
          )}
        </Panel>
      </div>

      <SectionHeading
        id="frequentation"
        index="04 / Fréquentation"
        title="Comment le site est utilisé"
        text="Audience, provenance et habitudes de consultation sur la même période."
        badge="Ensemble du site"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Pages vues"
          value={count(k.pageViews)}
          hint="Toutes les pages, consultations répétées comprises"
          icon={BarChart3}
        >
          <Delta current={k.pageViews} previous={data.previous.pageViews} />
        </Metric>
        <Metric
          label="Navigateurs identifiés"
          value={count(k.uniqueVisitors)}
          hint="Identifiants de suivi distincts, pas des personnes uniques"
          icon={UsersRound}
        >
          <Delta
            current={k.uniqueVisitors}
            previous={data.previous.uniqueVisitors}
          />
        </Metric>
        <Metric
          label="Page diagnostic"
          value={count(k.diagnosticPageViews)}
          hint={`${ratio(percent(k.diagnosticPageViews, k.pageViews))} de toutes les pages vues`}
          icon={ArrowUpRight}
        />
        <Metric
          label="Vues sans identifiant"
          value={count(k.unidentifiedViews)}
          hint="Non incluses dans le nombre de navigateurs identifiés"
          icon={MonitorSmartphone}
        />
      </div>
      <Heatmap activity={data.activity} />
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Sources de consultation"
          subtitle="Six premières sources · part de toutes les pages vues"
        >
          <Bars items={data.sources} total={k.pageViews} color="#6366f1" />
          <p className="mt-4 text-xs text-slate-500">
            Campagne UTM en priorité, sinon site référent. Les navigations
            internes peuvent aussi apparaître.
          </p>
        </Panel>
        <Panel
          title="Répartition par appareil"
          subtitle="Pages vues par type d’appareil, et non nombre de personnes"
        >
          <Bars items={data.devices} total={k.pageViews} color="#0d9488" />
        </Panel>
        <Panel
          title="Provenance géographique"
          subtitle="Six premières provenances · pays déduits des informations techniques"
          action={<Globe2 className="h-5 w-5 text-slate-400" />}
        >
          <Bars items={data.countries} total={k.pageViews} />
          <p className="mt-4 text-xs text-slate-500">
            Une provenance non identifiée correspond à une information absente,
            pas à un pays.
          </p>
        </Panel>
        <Panel
          title="Pages les plus consultées"
          subtitle="Six premières pages · part de toutes les consultations"
        >
          <Bars items={data.topPages} total={k.pageViews} color="#475569" />
        </Panel>
      </div>

      <Panel
        title="Derniers résultats de la période"
        subtitle="Huit dernières soumissions : niveau, score et durée, sans réponses détaillées ni identité"
      >
        {data.recentResults.length ? (
          <ul className="divide-y divide-slate-100">
            {data.recentResults.map((item) => {
              const level = data.levels.find(
                (level) => level.key === item.level,
              );
              return (
                <li
                  key={item.id}
                  className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_110px_100px_120px_130px]"
                >
                  <div className="min-w-0 break-words text-sm font-semibold text-slate-800">
                    {item.diagnostic}
                  </div>
                  <span
                    className="w-fit rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold"
                    style={{ color: level?.color || "#64748b" }}
                  >
                    {level?.label || "Non classé"}
                  </span>
                  <span className="text-xs text-slate-500">
                    Score : {ratio(item.scorePercent)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {duration(item.durationMs)}
                  </span>
                  <time
                    dateTime={item.createdAt}
                    className="text-xs text-slate-500"
                  >
                    {date(item.createdAt)}
                  </time>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty text="Aucun résultat reçu sur cette période." />
        )}
      </Panel>
      <details className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <summary className="cursor-pointer font-semibold text-slate-800">
          Comment lire ces indicateurs ?
        </summary>
        <div className="mt-4 grid gap-4 text-xs leading-6 md:grid-cols-2">
          <p>
            <strong>Période et comparaison.</strong> Les dates et créneaux sont
            en UTC. Le jour en cours est partiel. La comparaison utilise la
            durée immédiatement précédente, de longueur identique (
            {date(data.period.previousFrom)} au {date(data.period.from)}). Les
            semaines aux extrémités peuvent être partielles.
          </p>
          <p>
            <strong>Complétion.</strong> Part des tentatives démarrées dans la
            période ayant une soumission rattachée au même diagnostic à l’heure
            du relevé. Une tentative non terminée peut encore être reprise.
          </p>
          <p>
            <strong>Collecte.</strong> Les résultats et événements dépendent des
            données enregistrées par le site. Les bloqueurs, les durées
            manquantes et les soumissions sans tentative peuvent créer des
            écarts. Un identifiant de navigateur ne représente pas
            nécessairement une personne.
          </p>
          <p>
            <strong>Confidentialité et interprétation.</strong> Les graphiques
            ne montrent ni identité ni réponse détaillée. Ils décrivent l’usage
            de la plateforme et ses résultats ; ils ne constituent pas une
            enquête représentative de la population.
          </p>
        </div>
      </details>
    </div>
  );
}
