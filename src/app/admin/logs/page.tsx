import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
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
  type LucideIcon,
} from "lucide-react";
import { requireAdminModule } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

const EVENT_OPTIONS = [
  { value: "all", label: "Tous les événements" },
  { value: "page_leave", label: "Sorties de page" },
  { value: "page_view", label: "Pages vues" },
  { value: "page_engagement", label: "Engagement" },
  { value: "diagnostic_started", label: "Diagnostics commencés" },
  { value: "diagnostic_progress", label: "Progression diagnostic" },
  { value: "diagnostic_completed", label: "Diagnostics terminés" },
  { value: "diagnostic_result_shared", label: "Résultats partagés" },
  { value: "diagnostic_result_downloaded", label: "Images téléchargées" },
];

const EVENT_LABELS: Record<
  string,
  { label: string; tone: string; icon: LucideIcon }
> = {
  page_view: { label: "Page vue", tone: "bg-blue-50 text-blue-700", icon: Eye },
  page_leave: {
    label: "Sortie de page",
    tone: "bg-slate-100 text-slate-700",
    icon: LogOut,
  },
  page_engagement: {
    label: "Engagement",
    tone: "bg-violet-50 text-violet-700",
    icon: Clock3,
  },
  diagnostic_started: {
    label: "Diagnostic commencé",
    tone: "bg-orange-50 text-orange-700",
    icon: MousePointerClick,
  },
  diagnostic_progress: {
    label: "Progression",
    tone: "bg-amber-50 text-amber-700",
    icon: Activity,
  },
  diagnostic_completed: {
    label: "Diagnostic terminé",
    tone: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  diagnostic_result_shared: {
    label: "Résultat partagé",
    tone: "bg-pink-50 text-pink-700",
    icon: Share2,
  },
  diagnostic_result_downloaded: {
    label: "Image téléchargée",
    tone: "bg-cyan-50 text-cyan-700",
    icon: Share2,
  },
};

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return "Durée non mesurée";
  const roundedSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return minutes ? `${minutes} min ${seconds}s` : `${seconds}s`;
};

const getMetadata = (metadata: Prisma.JsonValue | null) =>
  metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, Prisma.JsonValue>)
    : {};

const getEventDetails = (
  eventName: string,
  metadata: Prisma.JsonValue | null,
) => {
  const data = getMetadata(metadata);
  if (eventName === "diagnostic_started") {
    return `${data.mode === "other" ? "Pour un proche" : "Mode personnel"} · ${data.totalQuestions || 0} questions`;
  }
  if (eventName === "diagnostic_progress") {
    return `Palier ${data.milestone || 0}% · ${data.answersCount || 0} réponses`;
  }
  if (eventName === "diagnostic_completed") {
    const level =
      data.level === "danger"
        ? "Danger"
        : data.level === "warning"
          ? "Vigilance"
          : "Relation saine";
    return `${level} · score ${data.totalScore || 0}/${data.maxScore || 0}`;
  }
  if (eventName.includes("shared") || eventName.includes("downloaded")) {
    return `Image ${String(data.format || "PNG").toUpperCase()} · ${data.method || "partage"}`;
  }
  return null;
};

const pageHref = (page: number, type: string, query: string) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (type !== "all") params.set("type", type);
  if (query) params.set("q", query);
  return `/admin/logs?${params.toString()}`;
};

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("logs");
  const params = await searchParams;
  const pageParam = Number(
    Array.isArray(params.page) ? params.page[0] : params.page,
  );
  const page =
    Number.isSafeInteger(pageParam) && pageParam > 0 && pageParam <= 1000000
      ? pageParam
      : 1;
  const requestedType = Array.isArray(params.type)
    ? params.type[0]
    : params.type;
  const type = EVENT_OPTIONS.some((option) => option.value === requestedType)
    ? requestedType!
    : "all";
  const query = String(
    Array.isArray(params.q) ? params.q[0] || "" : params.q || "",
  )
    .trim()
    .slice(0, 100);

  const where: Prisma.TrackingEventWhereInput = {
    ...(type !== "all" ? { eventName: type } : {}),
    ...(query
      ? {
          OR: [
            { eventName: { contains: query, mode: "insensitive" } },
            { path: { contains: query, mode: "insensitive" } },
            { sessionId: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { browser: { contains: query, mode: "insensitive" } },
            { os: { contains: query, mode: "insensitive" } },
            { deviceType: { contains: query, mode: "insensitive" } },
            { referrer: { contains: query, mode: "insensitive" } },
            { utmSource: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, logs, uniqueSessions, averageDuration] = await Promise.all([
    prisma.trackingEvent.count({ where }),
    prisma.trackingEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.trackingEvent.groupBy({
      by: ["sessionId"],
      where: { ...where, sessionId: { not: null } },
    }),
    prisma.trackingEvent.aggregate({ where, _avg: { durationMs: true } }),
  ]);

  const diagnosticIds = Array.from(
    new Set(
      logs
        .map((log) => log.diagnosticId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const diagnosticRows = diagnosticIds.length
    ? await prisma.diagnostic.findMany({
        where: { id: { in: diagnosticIds } },
        select: { id: true, title: true },
      })
    : [];
  const diagnosticMap = new Map(
    diagnosticRows.map((row) => [row.id, row.title]),
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total > 0 && page > totalPages) {
    redirect(pageHref(totalPages, type, query));
  }
  const safePage = Math.min(page, totalPages);
  const visiblePages = Array.from(
    new Set([1, safePage - 1, safePage, safePage + 1, totalPages]),
  ).filter((value) => value >= 1 && value <= totalPages);

  return (
    <div className="space-y-6 pb-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Activité du site
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Journaux d’activité
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Explorez les événements, leur provenance et le parcours des visiteurs.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Activity}
          label="Événements trouvés"
          value={total.toLocaleString("fr-FR")}
        />
        <SummaryCard
          icon={UsersRound}
          label="Identifiants de session distincts"
          value={uniqueSessions.length.toLocaleString("fr-FR")}
        />
        <SummaryCard
          icon={Clock3}
          label="Durée moyenne mesurée"
          value={formatDuration(averageDuration._avg.durationMs)}
        />
      </div>
      <form
        className="glass-card grid items-end gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_auto]"
        method="get"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Rechercher un événement
          </span>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-3 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Page, pays, session, navigateur…"
              className="glass-input w-full !py-2.5 !pl-10 text-sm"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Type d’événement
          </span>
          <select
            name="type"
            defaultValue={type}
            className="glass-input w-full !py-2.5 text-sm"
          >
            {EVENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="glass-button inline-flex min-h-11 items-center justify-center gap-2 !px-5 !py-2.5 text-sm"
          type="submit"
        >
          <Search size={16} aria-hidden="true" />
          Filtrer
        </button>
        {(query || type !== "all") && (
          <Link
            href="/admin/logs"
            className="text-sm font-semibold text-orange-700 sm:col-span-2"
          >
            Réinitialiser les filtres
          </Link>
        )}
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Événements récents
        </h2>
        <p className="text-xs text-slate-500">
          Indicateurs calculés sur les filtres actifs · Dates en UTC
        </p>
      </div>
      <div className="space-y-3">
        {logs.map((log) => {
          const config = EVENT_LABELS[log.eventName] || {
            label: log.eventName,
            tone: "bg-slate-100 text-slate-700",
            icon: Activity,
          };
          const EventIcon = config.icon;
          const details = getEventDetails(log.eventName, log.metadata);
          const diagnosticTitle = log.diagnosticId
            ? diagnosticMap.get(log.diagnosticId)
            : null;
          return (
            <article key={log.id} className="glass-card overflow-hidden">
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${config.tone}`}
                  >
                    <EventIcon size={15} aria-hidden="true" />
                    {config.label}
                  </span>
                  <time
                    dateTime={log.createdAt.toISOString()}
                    className="text-xs text-slate-500"
                  >
                    {log.createdAt.toLocaleString("fr-FR", { timeZone: "UTC" })}
                  </time>
                </div>
                <h3 className="mt-3 break-all font-semibold text-slate-900">
                  {diagnosticTitle || log.path}
                </h3>
                {diagnosticTitle && (
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {log.path}
                  </p>
                )}
                {details && (
                  <p className="mt-2 text-sm text-slate-600">{details}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <UserRound
                      size={15}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    <span className="break-all">
                      {log.user?.name || log.user?.email || "Visiteur anonyme"}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={15} aria-hidden="true" />
                    {formatDuration(log.durationMs)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={15} className="shrink-0" aria-hidden="true" />
                    {[log.city, log.country].filter(Boolean).join(", ") ||
                      "Localisation inconnue"}
                  </span>
                </div>
              </div>
              <details className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                <summary className="min-h-8 cursor-pointer text-sm font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <Eye size={16} aria-hidden="true" />
                    Détails de l’événement
                  </span>
                </summary>
                <dl className="mt-4 grid gap-5 pb-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-700">
                      <UserRound size={16} aria-hidden="true" />
                      Session
                    </dt>
                    <dd className="mt-2 break-all text-xs text-slate-500">
                      {log.sessionId || "Non renseignée"}
                    </dd>
                    <dd className="mt-1 break-all text-xs text-slate-500">
                      IP : {log.ip || "Non disponible"}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-700">
                      <Flag size={16} aria-hidden="true" />
                      Provenance
                    </dt>
                    <dd className="mt-2 break-words text-xs text-slate-500">
                      {log.utmSource ||
                        (log.referrer
                          ? "Site référent"
                          : "Aucune source renseignée")}
                    </dd>
                    {log.utmCampaign && (
                      <dd className="mt-1 break-all text-xs text-slate-500">
                        Campagne : {log.utmCampaign}
                      </dd>
                    )}
                    {log.referrer && (
                      <dd className="mt-1 break-all text-xs text-slate-500">
                        {log.referrer}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-700">
                      {log.deviceType?.toLowerCase() === "mobile" ? (
                        <Smartphone size={16} aria-hidden="true" />
                      ) : (
                        <Monitor size={16} aria-hidden="true" />
                      )}
                      Appareil
                    </dt>
                    <dd className="mt-2 text-xs text-slate-500">
                      {log.deviceType || "Non renseigné"}
                    </dd>
                    <dd className="mt-1 break-words text-xs text-slate-500">
                      {[log.browser, log.os].filter(Boolean).join(" · ") ||
                        log.deviceName ||
                        "Navigateur inconnu"}
                    </dd>
                    {log.screen && (
                      <dd className="mt-1 text-xs text-slate-500">
                        Écran : {log.screen}
                      </dd>
                    )}
                    {log.timezone && (
                      <dd className="mt-1 break-all text-xs text-slate-500">
                        Fuseau : {log.timezone}
                      </dd>
                    )}
                  </div>
                </dl>
              </details>
            </article>
          );
        })}
        {!logs.length && (
          <div className="glass-card p-8 text-center">
            <Activity
              size={30}
              className="mx-auto mb-3 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="font-semibold text-slate-700">
              Aucun événement trouvé
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Aucun événement ne correspond aux filtres.
            </p>
          </div>
        )}
      </div>
      <footer className="glass-card flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
        <p className="text-sm text-slate-500">
          {total === 0
            ? "0 événement"
            : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, total)} sur ${total}`}
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-1"
          aria-label="Pagination des logs"
        >
          <PaginationLink
            href={pageHref(Math.max(1, safePage - 1), type, query)}
            disabled={safePage <= 1}
            label="Précédent"
          >
            <ChevronLeft size={16} />
          </PaginationLink>
          {visiblePages.map((pageNumber, index) => (
            <span key={pageNumber} className="contents">
              {index > 0 && pageNumber - visiblePages[index - 1] > 1 && (
                <span className="px-1 text-slate-400">…</span>
              )}
              <Link
                href={pageHref(pageNumber, type, query)}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === safePage ? "page" : undefined}
                className={`inline-flex h-11 min-w-9 items-center justify-center rounded-xl text-sm font-semibold ${pageNumber === safePage ? "bg-[#eb5f2a] text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {pageNumber}
              </Link>
            </span>
          ))}
          <PaginationLink
            href={pageHref(Math.min(totalPages, safePage + 1), type, query)}
            disabled={safePage >= totalPages}
            label="Suivant"
          >
            <ChevronRight size={16} />
          </PaginationLink>
        </nav>
      </footer>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card p-5">
      <Icon size={20} className="mb-3 text-[#eb5f2a]" aria-hidden="true" />
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled)
    return (
      <span
        aria-label={label}
        className="w-9 h-11 rounded-xl inline-flex items-center justify-center text-slate-300"
      >
        {children}
      </span>
    );
  return (
    <Link
      href={href}
      aria-label={label}
      className="w-9 h-11 rounded-xl inline-flex items-center justify-center text-slate-600 hover:bg-slate-200"
    >
      {children}
    </Link>
  );
}
