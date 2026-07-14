import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import AnalyticsDashboard, {
  type AnalyticsDashboardData
} from '@/components/admin/AnalyticsDashboard';

type TimelineRow = {
  bucket: Date;
  starts: bigint;
  completions: bigint;
};

type ScoreRow = { average: number | null };
type PerformanceResultRow = {
  diagnosticId: string;
  completions: bigint;
  averageScore: number | null;
  danger: bigint;
};

const toNumber = (value: number | bigint | null | undefined) => Number(value || 0);

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getUTCDay() || 7;
  result.setUTCDate(result.getUTCDate() - day + 1);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

const buildTimeline = (days: number, rows: TimelineRow[]) => {
  const weekly = days > 30;
  const count = weekly ? 13 : days;
  const now = new Date();
  const rowMap = new Map(
    rows.map((row) => [
      new Date(row.bucket).toISOString().slice(0, 10),
      { starts: toNumber(row.starts), completions: toNumber(row.completions) }
    ])
  );

  return Array.from({ length: count }, (_, index) => {
    const date = weekly
      ? startOfWeek(new Date(now.getTime() - (count - 1 - index) * 7 * 86_400_000))
      : new Date(now.getTime() - (count - 1 - index) * 86_400_000);
    if (!weekly) date.setUTCHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    const values = rowMap.get(key) || { starts: 0, completions: 0 };
    return {
      key,
      label: date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        ...(weekly ? { timeZone: 'UTC' } : {})
      }),
      ...values
    };
  });
};

const sourceLabel = (utmSource: string | null, referrer: string | null) => {
  if (utmSource) return utmSource;
  if (!referrer) return 'Accès direct';
  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'Autre site';
  }
};

export default async function AdminStatsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requestedDays = Number(Array.isArray(params.days) ? params.days[0] : params.days);
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
  const requestedDiagnostic = Array.isArray(params.diagnostic)
    ? params.diagnostic[0]
    : params.diagnostic;
  const diagnostics = await prisma.diagnostic.findMany({
    select: { id: true, title: true },
    orderBy: { updatedAt: 'desc' }
  });
  const diagnosticId = diagnostics.some((item) => item.id === requestedDiagnostic)
    ? requestedDiagnostic!
    : 'all';
  const from = new Date(Date.now() - days * 86_400_000);

  const attemptWhere: Prisma.DiagnosticAttemptWhereInput = {
    startedAt: { gte: from },
    ...(diagnosticId !== 'all' ? { diagnosticId } : {})
  };
  const submissionWhere: Prisma.DiagnosticSubmissionWhereInput = {
    createdAt: { gte: from },
    ...(diagnosticId !== 'all' ? { diagnosticId } : {})
  };
  const trafficWhere: Prisma.TrackingEventWhereInput = {
    createdAt: { gte: from },
    eventName: 'page_view'
  };
  const diagnosticSqlFilter =
    diagnosticId === 'all'
      ? Prisma.empty
      : Prisma.sql`AND "diagnosticId" = ${diagnosticId}`;
  const bucketUnit = days > 30 ? 'week' : 'day';

  const [
    starts,
    completions,
    anonymousCompletions,
    durationAggregate,
    levelGroups,
    uniqueVisitorGroups,
    pageViews,
    diagnosticPageViews,
    topPagesRaw,
    deviceGroups,
    sourceGroups,
    timelineRows,
    scoreRows,
    attemptsByDiagnostic,
    performanceResultRows,
    recentSubmissions
  ] = await Promise.all([
    prisma.diagnosticAttempt.count({ where: attemptWhere }),
    prisma.diagnosticSubmission.count({ where: submissionWhere }),
    prisma.diagnosticSubmission.count({
      where: { ...submissionWhere, userId: null }
    }),
    prisma.diagnosticSubmission.aggregate({
      where: submissionWhere,
      _avg: { durationMs: true }
    }),
    prisma.diagnosticSubmission.groupBy({
      by: ['level'],
      where: submissionWhere,
      _count: { level: true }
    }),
    prisma.trackingEvent.groupBy({
      by: ['sessionId'],
      where: { ...trafficWhere, sessionId: { not: null } }
    }),
    prisma.trackingEvent.count({ where: trafficWhere }),
    prisma.trackingEvent.count({
      where: { ...trafficWhere, path: '/diagnostic' }
    }),
    prisma.trackingEvent.groupBy({
      by: ['path'],
      where: trafficWhere,
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 5
    }),
    prisma.trackingEvent.groupBy({
      by: ['deviceType'],
      where: trafficWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    prisma.trackingEvent.groupBy({
      by: ['utmSource', 'referrer'],
      where: trafficWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 30
    }),
    prisma.$queryRaw<TimelineRow[]>(Prisma.sql`
      WITH starts AS (
        SELECT date_trunc(${bucketUnit}, "startedAt") AS bucket, COUNT(*) AS value
        FROM "DiagnosticAttempt"
        WHERE "startedAt" >= ${from} ${diagnosticSqlFilter}
        GROUP BY 1
      ), completions AS (
        SELECT date_trunc(${bucketUnit}, "createdAt") AS bucket, COUNT(*) AS value
        FROM "DiagnosticSubmission"
        WHERE "createdAt" >= ${from} ${diagnosticSqlFilter}
        GROUP BY 1
      )
      SELECT COALESCE(starts.bucket, completions.bucket) AS bucket,
             COALESCE(starts.value, 0) AS starts,
             COALESCE(completions.value, 0) AS completions
      FROM starts
      FULL OUTER JOIN completions ON starts.bucket = completions.bucket
      ORDER BY bucket ASC
    `),
    prisma.$queryRaw<ScoreRow[]>(Prisma.sql`
      SELECT AVG(CASE WHEN "maxScore" > 0 THEN "totalScore" * 100.0 / "maxScore" ELSE 0 END)::float AS average
      FROM "DiagnosticSubmission"
      WHERE "createdAt" >= ${from} ${diagnosticSqlFilter}
    `),
    prisma.diagnosticAttempt.groupBy({
      by: ['diagnosticId'],
      where: { startedAt: { gte: from } },
      _count: { diagnosticId: true }
    }),
    prisma.$queryRaw<PerformanceResultRow[]>(Prisma.sql`
      SELECT "diagnosticId",
             COUNT(*) AS completions,
             AVG(CASE WHEN "maxScore" > 0 THEN "totalScore" * 100.0 / "maxScore" ELSE 0 END)::float AS "averageScore",
             COUNT(*) FILTER (WHERE level = 'danger') AS danger
      FROM "DiagnosticSubmission"
      WHERE "createdAt" >= ${from}
      GROUP BY "diagnosticId"
    `),
    prisma.diagnosticSubmission.findMany({
      where: submissionWhere,
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { diagnostic: { select: { title: true } } }
    })
  ]);

  const completionRate = starts ? Math.min(100, (completions / starts) * 100) : 0;
  const abandonmentRate = starts
    ? Math.max(0, ((starts - Math.min(starts, completions)) / starts) * 100)
    : 0;
  const levelMap = new Map(levelGroups.map((row) => [row.level, row._count.level]));
  const sourceMap = new Map<string, number>();
  sourceGroups.forEach((row) => {
    const label = sourceLabel(row.utmSource, row.referrer);
    sourceMap.set(label, (sourceMap.get(label) || 0) + row._count.id);
  });
  const attemptMap = new Map(
    attemptsByDiagnostic.map((row) => [row.diagnosticId, row._count.diagnosticId])
  );
  const resultMap = new Map(
    performanceResultRows.map((row) => [row.diagnosticId, row])
  );

  const data: AnalyticsDashboardData = {
    days,
    diagnosticId,
    diagnostics,
    kpis: {
      starts,
      completions,
      completionRate,
      abandonmentRate,
      uniqueVisitors: uniqueVisitorGroups.length,
      pageViews,
      averageDurationMs: durationAggregate._avg.durationMs || 0,
      averageScorePercent: scoreRows[0]?.average || 0,
      anonymousRate: completions ? (anonymousCompletions / completions) * 100 : 0
    },
    funnel: [
      { label: 'Visites de la page diagnostic', value: diagnosticPageViews, color: '#3b82f6' },
      { label: 'Diagnostics commencés', value: starts, color: '#eb5f2a' },
      { label: 'Résultats obtenus', value: completions, color: '#10b981' }
    ],
    timeline: buildTimeline(days, timelineRows),
    levels: [
      { key: 'safe', label: 'Relation saine', value: levelMap.get('safe') || 0, color: '#64748b' },
      { key: 'warning', label: 'Vigilance', value: levelMap.get('warning') || 0, color: '#f59e0b' },
      { key: 'danger', label: 'Danger', value: levelMap.get('danger') || 0, color: '#ef4444' }
    ],
    topPages: topPagesRaw.map((row) => ({ label: row.path, value: row._count.path })),
    devices: deviceGroups.map((row) => ({
      label: row.deviceType || 'Non identifié',
      value: row._count.id
    })),
    sources: Array.from(sourceMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    performance: diagnostics
      .filter((item) => diagnosticId === 'all' || item.id === diagnosticId)
      .map((diagnostic) => {
        const diagnosticStarts = attemptMap.get(diagnostic.id) || 0;
        const results = resultMap.get(diagnostic.id);
        const diagnosticCompletions = toNumber(results?.completions);
        return {
          id: diagnostic.id,
          title: diagnostic.title,
          starts: diagnosticStarts,
          completions: diagnosticCompletions,
          completionRate: diagnosticStarts
            ? Math.min(100, (diagnosticCompletions / diagnosticStarts) * 100)
            : 0,
          averageScorePercent: results?.averageScore || 0,
          danger: toNumber(results?.danger)
        };
      }),
    recentResults: recentSubmissions.map((submission) => ({
      id: submission.id,
      diagnostic: submission.diagnostic.title,
      level: submission.level,
      scorePercent: submission.maxScore
        ? (submission.totalScore / submission.maxScore) * 100
        : 0,
      durationMs: submission.durationMs,
      anonymous: !submission.userId,
      createdAt: submission.createdAt.toISOString()
    }))
  };

  return <AnalyticsDashboard data={data} />;
}
