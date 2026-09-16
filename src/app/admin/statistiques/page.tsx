import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminModule } from "@/lib/rbac";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import {
  analyticsPeriod,
  buildAnalyticsTimeline,
  percent,
  type AnalyticsDashboardData,
} from "@/lib/analytics-metrics";

type Count = number | bigint;
type AttemptsRow = { diagnosticId: string; starts: Count; completed: Count };
type ResultRow = {
  diagnosticId: string;
  total: Count;
  safe: Count;
  warning: Count;
  danger: Count;
  withoutAccount: Count;
  score: number | null;
  validScores: Count;
  averageDuration: number | null;
  medianDuration: number | null;
  timed: Count;
  short: Count;
  medium: Count;
  long: Count;
  veryLong: Count;
  self: Count;
  other: Count;
};
type TrafficRow = {
  period: string;
  views: Count;
  visitors: Count;
  unidentified: Count;
  diagnosticViews: Count;
};
const number = (value: Count | undefined) => Number(value || 0);

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminModule("statistics");
  const params = await searchParams;
  const requestedDays = Number(
    Array.isArray(params.days) ? params.days[0] : params.days,
  );
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
  const requestedDiagnostic = Array.isArray(params.diagnostic)
    ? params.diagnostic[0]
    : params.diagnostic;
  const diagnostics = await prisma.diagnostic.findMany({
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
  const diagnosticId = diagnostics.some(
    (item) => item.id === requestedDiagnostic,
  )
    ? requestedDiagnostic!
    : "all";
  const { from, to, previousFrom } = analyticsPeriod(days);
  const filter =
    diagnosticId === "all"
      ? Prisma.empty
      : Prisma.sql`AND "diagnosticId" = ${diagnosticId}`;
  const bucket = days > 30 ? "week" : "day";
  const submissionWhere: Prisma.DiagnosticSubmissionWhereInput = {
    createdAt: { gte: from, lt: to },
    ...(diagnosticId === "all" ? {} : { diagnosticId }),
  };
  // Traffic describes the whole site. It is deliberately separate from the diagnostic filter.
  const trafficWhere: Prisma.TrackingEventWhereInput = {
    eventName: "page_view",
    createdAt: { gte: from, lt: to },
  };
  const resultAggregate = Prisma.sql`
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE level = 'safe') AS safe,
    COUNT(*) FILTER (WHERE level = 'warning') AS warning,
    COUNT(*) FILTER (WHERE level = 'danger') AS danger,
    COUNT(*) FILTER (WHERE "userId" IS NULL) AS "withoutAccount",
    AVG("totalScore" * 100.0 / NULLIF("maxScore", 0)) FILTER (WHERE "maxScore" > 0 AND "totalScore" BETWEEN 0 AND "maxScore")::float AS score,
    COUNT(*) FILTER (WHERE "maxScore" > 0 AND "totalScore" BETWEEN 0 AND "maxScore") AS "validScores",
    AVG("durationMs") FILTER (WHERE "durationMs" > 0)::float AS "averageDuration",
    percentile_cont(0.5) WITHIN GROUP (ORDER BY "durationMs") FILTER (WHERE "durationMs" > 0)::float AS "medianDuration",
    COUNT(*) FILTER (WHERE "durationMs" > 0) AS timed,
    COUNT(*) FILTER (WHERE "durationMs" > 0 AND "durationMs" < 120000) AS short,
    COUNT(*) FILTER (WHERE "durationMs" >= 120000 AND "durationMs" < 300000) AS medium,
    COUNT(*) FILTER (WHERE "durationMs" >= 300000 AND "durationMs" < 600000) AS long,
    COUNT(*) FILTER (WHERE "durationMs" >= 600000) AS "veryLong",
    COUNT(*) FILTER (WHERE mode = 'self') AS self,
    COUNT(*) FILTER (WHERE mode = 'other') AS other
  `;
  // Two bounded batches avoid starting every database query at once.
  const [
    attemptRows,
    summaryRows,
    performanceRows,
    previousRows,
    trafficRows,
    timelineRows,
  ] = await Promise.all([
    prisma.$queryRaw<AttemptsRow[]>(Prisma.sql`
      SELECT a."diagnosticId", COUNT(*) AS starts,
        COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM "DiagnosticSubmission" s
          WHERE s."attemptId" = a.id AND s."diagnosticId" = a."diagnosticId" AND s."createdAt" < ${to}
        )) AS completed
      FROM "DiagnosticAttempt" a WHERE "startedAt" >= ${from} AND "startedAt" < ${to} ${filter}
      GROUP BY a."diagnosticId"
    `),
    prisma.$queryRaw<ResultRow[]>(
      Prisma.sql`SELECT ${resultAggregate} FROM "DiagnosticSubmission" WHERE "createdAt" >= ${from} AND "createdAt" < ${to} ${filter}`,
    ),
    prisma.$queryRaw<
      Array<{
        diagnosticId: string;
        total: Count;
        score: number | null;
        danger: Count;
      }>
    >(Prisma.sql`
      SELECT "diagnosticId", COUNT(*) AS total,
      AVG("totalScore" * 100.0 / NULLIF("maxScore", 0)) FILTER (WHERE "maxScore" > 0 AND "totalScore" BETWEEN 0 AND "maxScore")::float AS score,
      COUNT(*) FILTER (WHERE level = 'danger') AS danger
      FROM "DiagnosticSubmission" WHERE "createdAt" >= ${from} AND "createdAt" < ${to} ${filter} GROUP BY "diagnosticId"
    `),
    prisma.$queryRaw<Array<{ starts: Count; completions: Count }>>(Prisma.sql`
      SELECT (SELECT COUNT(*) FROM "DiagnosticAttempt" WHERE "startedAt" >= ${previousFrom} AND "startedAt" < ${from} ${filter}) AS starts,
      (SELECT COUNT(*) FROM "DiagnosticSubmission" WHERE "createdAt" >= ${previousFrom} AND "createdAt" < ${from} ${filter}) AS completions
    `),
    prisma.$queryRaw<TrafficRow[]>(Prisma.sql`
      SELECT CASE WHEN "createdAt" >= ${from} THEN 'current' ELSE 'previous' END AS period,
        COUNT(*) AS views, COUNT(DISTINCT NULLIF("sessionId", '')) AS visitors,
        COUNT(*) FILTER (WHERE "sessionId" IS NULL OR "sessionId" = '') AS unidentified,
        COUNT(*) FILTER (WHERE path = '/diagnostic') AS "diagnosticViews"
      FROM "TrackingEvent" WHERE "eventName" = 'page_view' AND "createdAt" >= ${previousFrom} AND "createdAt" < ${to} GROUP BY 1
    `),
    prisma.$queryRaw<
      Array<{ bucket: Date; starts: Count; completions: Count }>
    >(Prisma.sql`
      SELECT date_trunc(${bucket}, date) AS bucket, SUM(starts)::bigint AS starts, SUM(completions)::bigint AS completions
      FROM (
        SELECT "startedAt" AS date, 1 AS starts, 0 AS completions FROM "DiagnosticAttempt" WHERE "startedAt" >= ${from} AND "startedAt" < ${to} ${filter}
        UNION ALL
        SELECT "createdAt" AS date, 0 AS starts, 1 AS completions FROM "DiagnosticSubmission" WHERE "createdAt" >= ${from} AND "createdAt" < ${to} ${filter}
      ) events GROUP BY 1 ORDER BY 1
    `),
  ]);
  const [topPages, devices, countries, sources, activity, recentResults] =
    await Promise.all([
      prisma.trackingEvent.groupBy({
        by: ["path"],
        where: trafficWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      prisma.trackingEvent.groupBy({
        by: ["deviceType"],
        where: trafficWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      prisma.trackingEvent.groupBy({
        by: ["country"],
        where: trafficWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      prisma.$queryRaw<Array<{ label: string; value: Count }>>(Prisma.sql`
      SELECT CASE WHEN NULLIF(TRIM("utmSource"), '') IS NOT NULL THEN TRIM("utmSource")
        WHEN NULLIF(TRIM(referrer), '') IS NULL THEN 'Accès direct'
        WHEN referrer ~ '^https?://' THEN regexp_replace(referrer, '^https?://(www\\.)?([^/:?#]+).*$', '\\2')
        ELSE 'Autre source' END AS label, COUNT(*) AS value
      FROM "TrackingEvent" WHERE "eventName" = 'page_view' AND "createdAt" >= ${from} AND "createdAt" < ${to}
      GROUP BY 1 ORDER BY value DESC LIMIT 6
    `),
      prisma.$queryRaw<
        Array<{ day: number; hour: number; value: Count }>
      >(Prisma.sql`
      SELECT EXTRACT(ISODOW FROM "createdAt")::int - 1 AS day, EXTRACT(HOUR FROM "createdAt")::int AS hour, COUNT(*) AS value
      FROM "TrackingEvent" WHERE "eventName" = 'page_view' AND "createdAt" >= ${from} AND "createdAt" < ${to}
      GROUP BY 1, 2
    `),
      prisma.diagnosticSubmission.findMany({
        where: submissionWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          level: true,
          totalScore: true,
          maxScore: true,
          durationMs: true,
          createdAt: true,
          diagnostic: { select: { title: true } },
        },
      }),
    ]);
  const summary = summaryRows[0];
  const traffic = trafficRows.find((row) => row.period === "current");
  const previousTraffic = trafficRows.find((row) => row.period === "previous");
  const starts = attemptRows.reduce((sum, row) => sum + number(row.starts), 0);
  const completedStarts = attemptRows.reduce(
    (sum, row) => sum + number(row.completed),
    0,
  );
  const total = number(summary?.total);
  const attemptMap = new Map(attemptRows.map((row) => [row.diagnosticId, row]));
  const performanceMap = new Map(
    performanceRows.map((row) => [row.diagnosticId, row]),
  );
  const data: AnalyticsDashboardData = {
    days,
    diagnosticId,
    diagnostics,
    period: {
      from: from.toISOString(),
      to: to.toISOString(),
      previousFrom: previousFrom.toISOString(),
    },
    kpis: {
      starts,
      completions: total,
      completedStarts,
      unfinishedStarts: starts - completedStarts,
      completionRate: percent(completedStarts, starts),
      uniqueVisitors: number(traffic?.visitors),
      pageViews: number(traffic?.views),
      diagnosticPageViews: number(traffic?.diagnosticViews),
      averageDurationMs: summary?.averageDuration ?? null,
      medianDurationMs: summary?.medianDuration ?? null,
      durationSamples: number(summary?.timed),
      averageScorePercent: summary?.score ?? null,
      validScores: number(summary?.validScores),
      withoutAccount: number(summary?.withoutAccount),
      unidentifiedViews: number(traffic?.unidentified),
    },
    previous: {
      starts: number(previousRows[0]?.starts),
      completions: number(previousRows[0]?.completions),
      pageViews: number(previousTraffic?.views),
      uniqueVisitors: number(previousTraffic?.visitors),
    },
    timeline: buildAnalyticsTimeline(from, to, days > 30, timelineRows),
    levels: [
      {
        key: "safe",
        label: "Relation saine",
        value: number(summary?.safe),
        color: "#0d9488",
      },
      {
        key: "warning",
        label: "Vigilance",
        value: number(summary?.warning),
        color: "#d97706",
      },
      {
        key: "danger",
        label: "Danger",
        value: number(summary?.danger),
        color: "#e11d48",
      },
      {
        key: "unknown",
        label: "Non classé",
        value: Math.max(
          0,
          total -
            number(summary?.safe) -
            number(summary?.warning) -
            number(summary?.danger),
        ),
        color: "#94a3b8",
      },
    ],
    durations: [
      { label: "Moins de 2 min", value: number(summary?.short) },
      { label: "2 à moins de 5 min", value: number(summary?.medium) },
      { label: "5 à moins de 10 min", value: number(summary?.long) },
      { label: "10 min et plus", value: number(summary?.veryLong) },
    ],
    modes: [
      { label: "Pour soi", value: number(summary?.self), color: "#4f46e5" },
      {
        label: "Pour un proche",
        value: number(summary?.other),
        color: "#eb5f2a",
      },
      {
        label: "Non renseigné",
        value: total - number(summary?.self) - number(summary?.other),
        color: "#94a3b8",
      },
    ],
    topPages: topPages.map((row) => ({
      label: row.path,
      value: row._count.id,
    })),
    devices: devices.map((row) => ({
      label: row.deviceType || "Non identifié",
      value: row._count.id,
    })),
    countries: countries.map((row) => ({
      label:
        row.country && /^[A-Z]{2}$/.test(row.country)
          ? new Intl.DisplayNames(["fr"], { type: "region" }).of(row.country) ||
            row.country
          : row.country || "Non identifié",
      value: row._count.id,
    })),
    sources: sources.map((row) => ({
      label: row.label,
      value: number(row.value),
    })),
    activity: activity.map((row) => ({ ...row, value: number(row.value) })),
    performance: diagnostics
      .filter((item) => diagnosticId === "all" || item.id === diagnosticId)
      .map((item) => {
        const attempts = attemptMap.get(item.id);
        const results = performanceMap.get(item.id);
        return {
          ...item,
          starts: number(attempts?.starts),
          completedStarts: number(attempts?.completed),
          completions: number(results?.total),
          completionRate: percent(
            number(attempts?.completed),
            number(attempts?.starts),
          ),
          averageScorePercent: results?.score ?? null,
          danger: number(results?.danger),
        };
      }),
    recentResults: recentResults.map((row) => ({
      id: row.id,
      diagnostic: row.diagnostic.title,
      level: row.level,
      scorePercent:
        row.maxScore > 0 &&
        row.totalScore >= 0 &&
        row.totalScore <= row.maxScore
          ? (row.totalScore / row.maxScore) * 100
          : null,
      durationMs: row.durationMs && row.durationMs > 0 ? row.durationMs : null,
      createdAt: row.createdAt.toISOString(),
    })),
  };
  return <AnalyticsDashboard data={data} />;
}
