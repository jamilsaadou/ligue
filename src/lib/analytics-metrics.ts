export type ChartItem = { label: string; value: number; color?: string };
export type TimelinePoint = {
  key: string;
  label: string;
  starts: number;
  completions: number;
};

export const DAY_MS = 86_400_000;

export function analyticsPeriod(days: number, now = new Date()) {
  const from = new Date(now);
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - days + 1);
  return {
    from,
    to: now,
    previousFrom: new Date(from.getTime() - (now.getTime() - from.getTime())),
  };
}

function weekStart(date: Date) {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCDate(result.getUTCDate() - ((result.getUTCDay() + 6) % 7));
  return result;
}

export function buildAnalyticsTimeline(
  from: Date,
  to: Date,
  weekly: boolean,
  rows: Array<{
    bucket: Date;
    starts: bigint | number;
    completions: bigint | number;
  }>,
): TimelinePoint[] {
  const indexed = new Map(
    rows.map((row) => [new Date(row.bucket).toISOString().slice(0, 10), row]),
  );
  const cursor = weekly ? weekStart(from) : new Date(from);
  const points: TimelinePoint[] = [];
  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    const row = indexed.get(key);
    points.push({
      key,
      label: cursor.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }),
      starts: Number(row?.starts || 0),
      completions: Number(row?.completions || 0),
    });
    cursor.setUTCDate(cursor.getUTCDate() + (weekly ? 7 : 1));
  }
  return points;
}

export function percent(value: number, total: number): number | null {
  return total > 0 ? (value / total) * 100 : null;
}

export function variation(current: number, previous: number): number | null {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

export type AnalyticsDashboardData = {
  days: number;
  diagnosticId: string;
  diagnostics: Array<{ id: string; title: string }>;
  period: { from: string; to: string; previousFrom: string };
  kpis: {
    starts: number;
    completions: number;
    completedStarts: number;
    unfinishedStarts: number;
    completionRate: number | null;
    uniqueVisitors: number;
    pageViews: number;
    diagnosticPageViews: number;
    averageDurationMs: number | null;
    medianDurationMs: number | null;
    durationSamples: number;
    averageScorePercent: number | null;
    validScores: number;
    withoutAccount: number;
    unidentifiedViews: number;
  };
  previous: {
    starts: number;
    completions: number;
    pageViews: number;
    uniqueVisitors: number;
  };
  timeline: TimelinePoint[];
  levels: Array<ChartItem & { key: string; color: string }>;
  durations: ChartItem[];
  modes: ChartItem[];
  topPages: ChartItem[];
  devices: ChartItem[];
  sources: ChartItem[];
  countries: ChartItem[];
  activity: Array<{ day: number; hour: number; value: number }>;
  performance: Array<{
    id: string;
    title: string;
    starts: number;
    completions: number;
    completedStarts: number;
    completionRate: number | null;
    averageScorePercent: number | null;
    danger: number;
  }>;
  recentResults: Array<{
    id: string;
    diagnostic: string;
    level: string;
    scorePercent: number | null;
    durationMs: number | null;
    createdAt: string;
  }>;
};
