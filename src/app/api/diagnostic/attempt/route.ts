import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getRequestSession,
  normalizeClientContext,
  type ClientContext
} from '@/lib/analytics-server';

type AttemptPayload = ClientContext & {
  attemptId?: string;
  diagnosticId?: string;
  mode?: 'self' | 'other';
  totalQuestions?: number;
  answersCount?: number;
  milestone?: number;
};

const validId = (value: unknown) =>
  typeof value === 'string' && value.length >= 8 && value.length <= 100;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AttemptPayload;
    if (
      !validId(payload.attemptId) ||
      !validId(payload.diagnosticId) ||
      !['self', 'other'].includes(payload.mode || '') ||
      !Number.isInteger(payload.totalQuestions) ||
      Number(payload.totalQuestions) <= 0
    ) {
      return NextResponse.json({ ok: false, message: 'Tentative invalide.' }, { status: 400 });
    }

    const diagnostic = await prisma.diagnostic.findUnique({
      where: { id: payload.diagnosticId },
      select: { id: true }
    });
    if (!diagnostic) {
      return NextResponse.json({ ok: false, message: 'Diagnostic introuvable.' }, { status: 404 });
    }

    const session = getRequestSession(request);
    const context = normalizeClientContext(request, payload);
    const existing = await prisma.diagnosticAttempt.findUnique({
      where: { id: payload.attemptId }
    });

    if (!existing) {
      await prisma.$transaction([
        prisma.diagnosticAttempt.create({
          data: {
            id: payload.attemptId!,
            diagnosticId: payload.diagnosticId!,
            userId: session?.id || null,
            sessionId: context.sessionId,
            mode: payload.mode!,
            totalQuestions: Number(payload.totalQuestions),
            answersCount: Math.max(0, Number(payload.answersCount) || 0),
            referrer: context.referrer,
            country: context.country,
            userAgent: context.userAgent,
            browser: context.browser,
            os: context.os,
            deviceType: context.deviceType
          }
        }),
        prisma.trackingEvent.create({
          data: {
            eventName: 'diagnostic_started',
            eventCategory: 'diagnostic',
            path: '/diagnostic',
            diagnosticId: payload.diagnosticId,
            attemptId: payload.attemptId,
            sessionId: context.sessionId,
            userId: session?.id || null,
            referrer: context.referrer,
            country: context.country,
            city: context.city,
            userAgent: context.userAgent,
            deviceName: context.deviceName,
            deviceType: context.deviceType,
            browser: context.browser,
            os: context.os,
            language: context.language,
            screen: context.screen,
            timezone: context.timezone,
            utmSource: context.utmSource,
            utmMedium: context.utmMedium,
            utmCampaign: context.utmCampaign,
            metadata: {
              mode: payload.mode!,
              totalQuestions: Number(payload.totalQuestions)
            }
          }
        })
      ]);
    }

    return NextResponse.json({ ok: true, attemptId: payload.attemptId });
  } catch (error) {
    console.error('Diagnostic attempt start error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de démarrer le suivi du diagnostic.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as AttemptPayload;
    if (!validId(payload.attemptId) || !validId(payload.diagnosticId)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const answersCount = Math.max(0, Number(payload.answersCount) || 0);
    const attempt = await prisma.diagnosticAttempt.updateMany({
      where: {
        id: payload.attemptId,
        diagnosticId: payload.diagnosticId,
        status: 'started'
      },
      data: { answersCount }
    });

    if (attempt.count && payload.milestone) {
      const session = getRequestSession(request);
      const context = normalizeClientContext(request, payload);
      await prisma.trackingEvent.create({
        data: {
          eventName: 'diagnostic_progress',
          eventCategory: 'diagnostic',
          path: '/diagnostic',
          diagnosticId: payload.diagnosticId,
          attemptId: payload.attemptId,
          sessionId: context.sessionId,
          userId: session?.id || null,
          country: context.country,
          deviceType: context.deviceType,
          browser: context.browser,
          os: context.os,
          metadata: {
            answersCount,
            milestone: Math.min(100, Math.max(0, Number(payload.milestone)))
          }
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Diagnostic attempt progress error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
