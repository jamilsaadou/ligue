import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminModule } from '@/lib/rbac';
import { normalizeSiteBranding } from '@/lib/site-config-shared';
import { encryptSecret } from '@/lib/secrets';

type SettingsPayload = Record<string, unknown> & {
  smtpPassword?: unknown;
  clearSmtpPassword?: unknown;
};

const STRING_LIMITS: Record<string, number> = {
  siteName: 80,
  siteTagline: 140,
  organizationName: 180,
  siteDescription: 600,
  supportEmail: 180,
  supportPhone: 50,
  siteLocation: 120,
  clinicWhatsapp: 50,
  clinicPsychologistPhone: 50,
  clinicCaseManagerPhone: 50,
  facebookUrl: 500,
  instagramUrl: 500,
  twitterUrl: 500,
  youtubeUrl: 500,

  emergencyNumber: 30,
  smtpHost: 255,
  smtpUsername: 255,
  smtpFromName: 120,
  smtpFromEmail: 180,
  diagnosticNotificationEmail: 180
};

const BOOLEAN_KEYS = [
  'publicAuthEnabled',
  'smtpEnabled',
  'notifyOnDiagnostic',
  'smtpSecure',
  'smtpRejectUnauthorized'
];

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const authError = (error: unknown) => {
  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
  }
  if (error instanceof Error && error.message === 'FORBIDDEN') {
    return NextResponse.json({ ok: false, message: 'Accès refusé.' }, { status: 403 });
  }
  return null;
};

export async function POST(request: Request) {
  try {
    await requireAdminModule('settings');
    const payload = (await request.json()) as SettingsPayload;
    const sanitized: Record<string, Prisma.InputJsonValue> = {};

    Object.entries(STRING_LIMITS).forEach(([key, limit]) => {
      if (typeof payload[key] === 'string') {
        const value = payload[key].trim();
        sanitized[key] = (['siteName', 'siteTagline', 'organizationName', 'siteDescription', 'smtpFromName'].includes(key)
          ? normalizeSiteBranding(value)
          : value).slice(0, limit);
      }
    });
    for (const key of ['facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl']) {
      const value = sanitized[key];
      if (typeof value === 'string' && value) {
        try {
          const url = new URL(value);
          if (url.protocol !== 'https:') throw new Error('Invalid URL');
        } catch {
          return NextResponse.json({ ok: false, message: 'Les liens sociaux doivent être des URL HTTPS valides.' }, { status: 400 });
        }
      }
    }
    if (sanitized.clinicWhatsapp && !/^227\d{8}$/.test(String(sanitized.clinicWhatsapp).replace(/[\s().-]/g, '').replace(/^\+/, ''))) {
      return NextResponse.json({ ok: false, message: 'Indiquez le WhatsApp avec son indicatif +227.' }, { status: 400 });
    }
    BOOLEAN_KEYS.forEach((key) => {
      if (typeof payload[key] === 'boolean') sanitized[key] = payload[key];
    });

    if (payload.analyticsRetentionDays !== undefined) {
      sanitized.analyticsRetentionDays = Math.min(
        730,
        Math.max(30, Math.round(Number(payload.analyticsRetentionDays) || 365))
      );
    }
    if (payload.smtpPort !== undefined) {
      sanitized.smtpPort = Math.min(
        65535,
        Math.max(1, Math.round(Number(payload.smtpPort) || 587))
      );
    }

    if (typeof payload.logoDataUrl === 'string') {
      const logo = payload.logoDataUrl.trim();
      const validLogo =
        !logo || /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(logo);
      if (!validLogo || logo.length > 1_100_000) {
        return NextResponse.json(
          { ok: false, message: 'Le logo doit être une image PNG, JPEG ou WebP de moins de 750 Ko.' },
          { status: 400 }
        );
      }
      sanitized.logoDataUrl = logo;
    }

    if (typeof payload.smtpPassword === 'string' && payload.smtpPassword.trim()) {
      if (payload.smtpPassword.length > 500) {
        return NextResponse.json({ ok: false, message: 'Mot de passe SMTP invalide.' }, { status: 400 });
      }
      sanitized.smtpPasswordEncrypted = encryptSecret(payload.smtpPassword);
    } else if (payload.clearSmtpPassword === true) {
      sanitized.smtpPasswordEncrypted = '';
    }

    const smtpFromEmail = String(sanitized.smtpFromEmail || '');
    const notificationEmail = String(sanitized.diagnosticNotificationEmail || '');
    const supportEmail = String(sanitized.supportEmail || '');
    if (smtpFromEmail && !isEmail(smtpFromEmail)) {
      return NextResponse.json({ ok: false, message: "L'email expéditeur est invalide." }, { status: 400 });
    }
    if (notificationEmail && !isEmail(notificationEmail)) {
      return NextResponse.json({ ok: false, message: "L'email de notification est invalide." }, { status: 400 });
    }
    if (supportEmail && !isEmail(supportEmail)) {
      return NextResponse.json({ ok: false, message: "L'email support est invalide." }, { status: 400 });
    }
    if (
      sanitized.smtpEnabled === true &&
      (!sanitized.smtpHost || !smtpFromEmail || !notificationEmail)
    ) {
      return NextResponse.json(
        { ok: false, message: "Renseignez le serveur SMTP, l'expéditeur et le destinataire." },
        { status: 400 }
      );
    }

    const entries = Object.entries(sanitized);
    if (entries.length) {
      await prisma.$transaction(
        entries.map(([key, value]) =>
          prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
          })
        )
      );
    }

    return NextResponse.json({
      ok: true,
      smtpPasswordConfigured:
        Boolean(sanitized.smtpPasswordEncrypted) || undefined
    });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    console.error('Settings update error:', error);
    return NextResponse.json(
      { ok: false, message: 'Impossible de mettre à jour la configuration.' },
      { status: 500 }
    );
  }
}
