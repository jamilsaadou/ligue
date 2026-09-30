import { prisma } from '@/lib/prisma';
import {
  DEFAULT_SITE_CONFIG,
  type PublicSiteConfig
} from '@/lib/site-config-shared';

const valueAsString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export const getPublicSiteConfig = async (): Promise<PublicSiteConfig> => {
  const keys = Object.keys(DEFAULT_SITE_CONFIG);
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const values = new Map(settings.map((setting) => [setting.key, setting.value]));
  return {
    publicAuthEnabled: values.get('publicAuthEnabled') === true,
    siteName: valueAsString(values.get('siteName'), DEFAULT_SITE_CONFIG.siteName),
    siteTagline: valueAsString(values.get('siteTagline'), DEFAULT_SITE_CONFIG.siteTagline),
    organizationName: valueAsString(
      values.get('organizationName'),
      DEFAULT_SITE_CONFIG.organizationName
    ),
    siteDescription: valueAsString(
      values.get('siteDescription') === "Première plateforme numérique d'autodiagnostic des violences en Afrique de l'Ouest."
        ? DEFAULT_SITE_CONFIG.siteDescription
        : values.get('siteDescription'),
      DEFAULT_SITE_CONFIG.siteDescription
    ),
    supportEmail: valueAsString(values.get('supportEmail'), DEFAULT_SITE_CONFIG.supportEmail),
    supportPhone: valueAsString(values.get('supportPhone'), DEFAULT_SITE_CONFIG.supportPhone),
    clinicWhatsapp: valueAsString(values.get('clinicWhatsapp'), DEFAULT_SITE_CONFIG.clinicWhatsapp),
    clinicPsychologistPhone: valueAsString(values.get('clinicPsychologistPhone'), DEFAULT_SITE_CONFIG.clinicPsychologistPhone),
    clinicCaseManagerPhone: valueAsString(values.get('clinicCaseManagerPhone'), DEFAULT_SITE_CONFIG.clinicCaseManagerPhone),
    facebookUrl: valueAsString(values.get('facebookUrl'), DEFAULT_SITE_CONFIG.facebookUrl),
    instagramUrl: valueAsString(values.get('instagramUrl'), DEFAULT_SITE_CONFIG.instagramUrl),
    twitterUrl: valueAsString(values.get('twitterUrl'), DEFAULT_SITE_CONFIG.twitterUrl),
    youtubeUrl: valueAsString(values.get('youtubeUrl'), DEFAULT_SITE_CONFIG.youtubeUrl),
    siteLocation: valueAsString(values.get('siteLocation'), DEFAULT_SITE_CONFIG.siteLocation),
    emergencyNumber: valueAsString(
      values.get('emergencyNumber'),
      DEFAULT_SITE_CONFIG.emergencyNumber
    ),
    logoDataUrl:
      typeof values.get('logoDataUrl') === 'string' && values.get('logoDataUrl')
        ? (values.get('logoDataUrl') as string)
        : DEFAULT_SITE_CONFIG.logoDataUrl
  };
};
