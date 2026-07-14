import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  getRequestSession,
  normalizeClientContext,
  type ClientContext
} from '@/lib/analytics-server';
import { sendDiagnosticNotification } from '@/lib/mailer';

type SubmissionPayload = ClientContext & {
  diagnosticId?: string;
  attemptId?: string;
  mode?: 'self' | 'other';
  totalScore?: number;
  maxScore?: number;
  level?: string;
  durationMs?: number;
  answers?: Record<string, number>;
  categoryScores?: unknown;
};

const validId = (value: unknown) =>
  typeof value === 'string' && value.length >= 8 && value.length <= 100;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;
    if (
      !validId(payload.diagnosticId) ||
      !['safe', 'warning', 'danger'].includes(payload.level || '')
    ) {
      return NextResponse.json(
        { ok: false, message: 'Diagnostic invalide.' },
        { status: 400 }
      );
    }

    const diagnostic = await prisma.diagnostic.findUnique({
      where: { id: payload.diagnosticId },
      select: { id: true, title: true }
    });
    if (!diagnostic) {
      return NextResponse.json(
        { ok: false, message: 'Diagnostic introuvable.' },
        { status: 404 }
      );
    }

    const session = getRequestSession(request);
    const context = normalizeClientContext(request, payload);
    const attemptId = validId(payload.attemptId) ? payload.attemptId! : null;
    const totalScore = Math.max(0, Math.round(Number(payload.totalScore) || 0));
    const maxScore = Math.max(0, Math.round(Number(payload.maxScore) || 0));
    const durationMs = Number.isFinite(payload.durationMs)
      ? Math.max(0, Math.min(24 * 60 * 60 * 1000, Math.round(payload.durationMs!)))
      : null;
    const answers = payload.answers || {};
    const answersCount = Object.keys(answers).length;

    const result = await prisma.$transaction(async (tx) => {
      if (attemptId) {
        const existingSubmission = await tx.diagnosticSubmission.findUnique({
          where: { attemptId }
        });
        if (existingSubmission) {
          return { submission: existingSubmission, isNew: false };
        }

        await tx.diagnosticAttempt.upsert({
          where: { id: attemptId },
          update: {
            status: 'completed',
            answersCount,
            totalScore,
            maxScore,
            level: payload.level!,
            durationMs,
            completedAt: new Date(),
            userId: session?.id || undefined,
            sessionId: context.sessionId || undefined
          },
          create: {
            id: attemptId,
            diagnosticId: payload.diagnosticId!,
            userId: session?.id || null,
            sessionId: context.sessionId,
            mode: payload.mode || 'self',
            status: 'completed',
            answersCount,
            totalQuestions: answersCount,
            totalScore,
            maxScore,
            level: payload.level!,
            durationMs,
            completedAt: new Date(),
            referrer: context.referrer,
            country: context.country,
            userAgent: context.userAgent,
            browser: context.browser,
            os: context.os,
            deviceType: context.deviceType
          }
        });
      }

      const created = await tx.diagnosticSubmission.create({
        data: {
          diagnosticId: payload.diagnosticId!,
          attemptId,
          userId: session?.id || null,
          sessionId: context.sessionId,
          mode: payload.mode || 'self',
          totalScore,
          maxScore,
          level: payload.level!,
          durationMs,
          answers,
          categoryScores: (payload.categoryScores || {}) as Prisma.InputJsonValue
        }
      });

      await tx.trackingEvent.create({
        data: {
          eventName: 'diagnostic_completed',
          eventCategory: 'diagnostic',
          path: '/diagnostic',
          diagnosticId: payload.diagnosticId,
          attemptId,
          sessionId: context.sessionId,
          userId: session?.id || null,
          durationMs,
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
            mode: payload.mode || 'self',
            level: payload.level!,
            totalScore,
            maxScore,
            answersCount
          }
        }
      });

      return { submission: created, isNew: true };
    });

    let notificationSent = false;
    if (result.isNew) {
      try {
        const notification = await sendDiagnosticNotification({
          diagnosticTitle: diagnostic.title,
          level: payload.level!,
          totalScore,
          maxScore,
          mode: payload.mode || 'self',
          durationMs,
          anonymous: !session?.id,
          country: context.country,
          completedAt: result.submission.createdAt
        });
        notificationSent = notification.sent;
      } catch (notificationError) {
        console.error('Diagnostic notification error:', notificationError);
      }
    }

    return NextResponse.json({
      ok: true,
      submissionId: result.submission.id,
      notificationSent
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de soumettre le diagnostic.' },
      { status: 500 }
    );
  }
}
