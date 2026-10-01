import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { decryptSecret } from '@/lib/secrets';
import { normalizeSiteBranding } from '@/lib/site-config-shared';

type SmtpSettings = {
  enabled: boolean;
  notifyOnDiagnostic: boolean;
  host: string;
  port: number;
  secure: boolean;
  rejectUnauthorized: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  notificationEmail: string;
};

export type DiagnosticNotification = {
  diagnosticTitle: string;
  level: string;
  totalScore: number;
  maxScore: number;
  mode: 'self' | 'other';
  durationMs: number | null;
  anonymous: boolean;
  country: string | null;
  completedAt: Date;
};

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const asBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback;

const getSmtpSettings = async (): Promise<SmtpSettings> => {
  const keys = [
    'smtpEnabled',
    'notifyOnDiagnostic',
    'smtpHost',
    'smtpPort',
    'smtpSecure',
    'smtpRejectUnauthorized',
    'smtpUsername',
    'smtpPasswordEncrypted',
    'smtpFromName',
    'smtpFromEmail',
    'diagnosticNotificationEmail'
  ];
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const encryptedPassword = asString(values.get('smtpPasswordEncrypted'));
  return {
    enabled: asBoolean(values.get('smtpEnabled')),
    notifyOnDiagnostic: asBoolean(values.get('notifyOnDiagnostic'), true),
    host: asString(values.get('smtpHost')),
    port: Math.min(65535, Math.max(1, Number(values.get('smtpPort')) || 587)),
    secure: asBoolean(values.get('smtpSecure')),
    rejectUnauthorized: asBoolean(values.get('smtpRejectUnauthorized'), true),
    username: asString(values.get('smtpUsername')),
    password: encryptedPassword ? decryptSecret(encryptedPassword) || '' : '',
    fromName: normalizeSiteBranding(asString(values.get('smtpFromName'))) || 'Sister for Sister',
    fromEmail: asString(values.get('smtpFromEmail')),
    notificationEmail: asString(values.get('diagnosticNotificationEmail'))
  };
};

const createTransporter = (settings: SmtpSettings) => {
  if (!settings.host || !settings.fromEmail || !settings.notificationEmail) {
    throw new Error('SMTP_INCOMPLETE');
  }
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.username
      ? { user: settings.username, pass: settings.password }
      : undefined,
    tls: { rejectUnauthorized: settings.rejectUnauthorized },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return entities[character];
  });

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return 'Non mesurée';
  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.round((durationMs % 60_000) / 1000);
  return minutes ? `${minutes} min ${seconds} s` : `${seconds} s`;
};

const levelLabel = (level: string) =>
  level === 'danger' ? 'Danger' : level === 'warning' ? 'Vigilance' : 'Relation saine';

export const sendDiagnosticNotification = async (notification: DiagnosticNotification) => {
  const settings = await getSmtpSettings();
  if (!settings.enabled || !settings.notifyOnDiagnostic) return { sent: false, skipped: true };
  const transporter = createTransporter(settings);
  const scorePercent = notification.maxScore
    ? Math.round((notification.totalScore / notification.maxScore) * 100)
    : 0;
  const title = escapeHtml(notification.diagnosticTitle);
  const result = levelLabel(notification.level);

  await transporter.sendMail({
    from: { name: settings.fromName, address: settings.fromEmail },
    to: settings.notificationEmail,
    subject: `Nouveau diagnostic terminé - ${result}`,
    text: [
      'Un nouveau diagnostic vient d’être terminé.',
      `Diagnostic : ${notification.diagnosticTitle}`,
      `Résultat : ${result}`,
      `Score : ${notification.totalScore}/${notification.maxScore} (${scorePercent}%)`,
      `Mode : ${notification.mode === 'other' ? 'Pour un proche' : 'Personnel'}`,
      `Profil : ${notification.anonymous ? 'Visiteur anonyme' : 'Utilisateur connecté'}`,
      `Durée : ${formatDuration(notification.durationMs)}`,
      `Pays : ${notification.country || 'Non identifié'}`,
      `Date : ${notification.completedAt.toLocaleString('fr-FR')}`
    ].join('\n'),
    html: `
      <div style="background:#f8fafc;padding:32px;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
          <div style="background:#eb5f2a;color:#fff;padding:24px 28px">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.85">Sister for Sister</div>
            <h1 style="font-size:24px;margin:8px 0 0">Nouveau diagnostic terminé</h1>
          </div>
          <div style="padding:28px">
            <p style="margin:0 0 22px;color:#475569">Un nouveau résultat anonyme ou connecté vient d’être enregistré.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:10px 0;color:#64748b">Diagnostic</td><td style="padding:10px 0;font-weight:700;text-align:right">${title}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Résultat</td><td style="padding:10px 0;font-weight:700;text-align:right">${result}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Score</td><td style="padding:10px 0;font-weight:700;text-align:right">${notification.totalScore}/${notification.maxScore} (${scorePercent}%)</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Mode</td><td style="padding:10px 0;text-align:right">${notification.mode === 'other' ? 'Pour un proche' : 'Personnel'}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Profil</td><td style="padding:10px 0;text-align:right">${notification.anonymous ? 'Visiteur anonyme' : 'Utilisateur connecté'}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Durée</td><td style="padding:10px 0;text-align:right">${formatDuration(notification.durationMs)}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Pays</td><td style="padding:10px 0;text-align:right">${escapeHtml(notification.country || 'Non identifié')}</td></tr>
              <tr><td style="padding:10px 0;color:#64748b">Date</td><td style="padding:10px 0;text-align:right">${notification.completedAt.toLocaleString('fr-FR')}</td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Les réponses détaillées ne sont jamais incluses dans cet email.</p>
          </div>
        </div>
      </div>`
  });
  return { sent: true, skipped: false };
};

export const sendSmtpTestEmail = async () => {
  const settings = await getSmtpSettings();
  const transporter = createTransporter(settings);
  await transporter.verify();
  await transporter.sendMail({
    from: { name: settings.fromName, address: settings.fromEmail },
    to: settings.notificationEmail,
    subject: 'Test SMTP - Sister for Sister',
    text: 'La configuration SMTP fonctionne. Les notifications de nouveaux diagnostics peuvent être envoyées.',
    html: '<div style="font-family:Arial,sans-serif;padding:24px"><h2 style="color:#eb5f2a">Configuration SMTP validée</h2><p>Les notifications de nouveaux diagnostics peuvent être envoyées depuis Sister for Sister.</p></div>'
  });
  return settings.notificationEmail;
};
