import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  getClientIp,
  anonymousDiagnosticContext,
  getRequestSession,
  normalizeClientContext,
  type ClientContext
} from '@/lib/analytics-server';

type TrackPayload = ClientContext & {
  path?: string;
  eventName?: string;
  eventCategory?: string;
  durationMs?: number;
  diagnosticId?: string;
  attemptId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const clip = (value: unknown, max = 255) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;

const parseBody = async (request: Request): Promise<TrackPayload | null> => {
  try {
    const text = await request.text();
    if (!text || text.length > 32_000) return null;
    return JSON.parse(text) as TrackPayload;
  } catch {
    return null;
  }
};

const normalizeMetadata = (metadata: TrackPayload['metadata']) => {
  if (!metadata) return undefined;
  const entries = Object.entries(metadata).slice(0, 20);
  return Object.fromEntries(
    entries.map(([key, value]) => [key.slice(0, 80), value])
  ) as Prisma.InputJsonObject;
};

export async function POST(request: Request) {
  try {
    const payload = await parseBody(request);
    if (!payload?.path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const isDiagnostic = payload.path.split('?')[0] === '/diagnostic' ||
      payload.eventCategory === 'diagnostic' || Boolean(payload.attemptId) ||
      Boolean(payload.diagnosticId) || payload.eventName?.startsWith('diagnostic_');
    const session = isDiagnostic ? null : getRequestSession(request);
    const context = isDiagnostic
      ? anonymousDiagnosticContext(request, payload)
      : normalizeClientContext(request, payload);
    const eventName = clip(payload.eventName) || 'page_view';
    const durationMs = Number.isFinite(payload.durationMs)
      ? Math.max(0, Math.min(24 * 60 * 60 * 1000, Math.round(payload.durationMs!)))
      : null;

    await prisma.trackingEvent.create({
      data: {
        eventName,
        eventCategory: clip(payload.eventCategory),
        path: payload.path.slice(0, 1000),
        durationMs,
        referrer: context.referrer,
        sessionId: context.sessionId,
        deviceName: context.deviceName,
        userAgent: context.userAgent,
        deviceType: context.deviceType,
        browser: context.browser,
        os: context.os,
        language: context.language,
        screen: context.screen,
        timezone: context.timezone,
        utmSource: context.utmSource,
        utmMedium: context.utmMedium,
        utmCampaign: context.utmCampaign,
        diagnosticId: clip(payload.diagnosticId),
        attemptId: clip(payload.attemptId),
        metadata: normalizeMetadata(payload.metadata),
        ip: isDiagnostic ? null : getClientIp(request),
        country: context.country,
        city: context.city,
        userId: session?.id || null
      }
    });

    // Keep analytics long enough for trends without doing cleanup on every hit.
    if (Math.random() < 0.01) {
      const retentionSetting = await prisma.setting.findUnique({
        where: { key: 'analyticsRetentionDays' }
      });
      const retentionDays = Math.max(30, Number(retentionSetting?.value) || 365);
      const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      await prisma.trackingEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
