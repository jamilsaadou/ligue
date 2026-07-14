import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/SettingsForm';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config-shared';

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany();
  const settingsMap = settings.reduce<Record<string, unknown>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Configuration
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres système</h1>
        <p className="text-slate-600 mt-2">
          Personnalisez le site, les notifications SMTP et la conservation des données.
        </p>
      </div>

      <SettingsForm
        initial={{
          siteName: (settingsMap.siteName as string) || DEFAULT_SITE_CONFIG.siteName,
          siteTagline:
            (settingsMap.siteTagline as string) || DEFAULT_SITE_CONFIG.siteTagline,
          organizationName:
            (settingsMap.organizationName as string) ||
            DEFAULT_SITE_CONFIG.organizationName,
          siteDescription:
            (settingsMap.siteDescription as string) ||
            DEFAULT_SITE_CONFIG.siteDescription,
          supportEmail:
            (settingsMap.supportEmail as string) || DEFAULT_SITE_CONFIG.supportEmail,
          supportPhone:
            (settingsMap.supportPhone as string) || DEFAULT_SITE_CONFIG.supportPhone,
          siteLocation:
            (settingsMap.siteLocation as string) || DEFAULT_SITE_CONFIG.siteLocation,
          emergencyNumber:
            (settingsMap.emergencyNumber as string) ||
            DEFAULT_SITE_CONFIG.emergencyNumber,
          logoDataUrl: (settingsMap.logoDataUrl as string) || '',
          analyticsRetentionDays:
            Number(settingsMap.analyticsRetentionDays) || 365,
          smtpEnabled: Boolean(settingsMap.smtpEnabled),
          notifyOnDiagnostic:
            settingsMap.notifyOnDiagnostic === undefined
              ? true
              : Boolean(settingsMap.notifyOnDiagnostic),
          smtpHost: (settingsMap.smtpHost as string) || '',
          smtpPort: Number(settingsMap.smtpPort) || 587,
          smtpSecure: Boolean(settingsMap.smtpSecure),
          smtpRejectUnauthorized:
            settingsMap.smtpRejectUnauthorized === undefined
              ? true
              : Boolean(settingsMap.smtpRejectUnauthorized),
          smtpUsername: (settingsMap.smtpUsername as string) || '',
          smtpPassword: '',
          smtpPasswordConfigured: Boolean(settingsMap.smtpPasswordEncrypted),
          smtpFromName:
            (settingsMap.smtpFromName as string) || DEFAULT_SITE_CONFIG.siteName,
          smtpFromEmail: (settingsMap.smtpFromEmail as string) || '',
          diagnosticNotificationEmail:
            (settingsMap.diagnosticNotificationEmail as string) || ''
        }}
      />
    </div>
  );
}
