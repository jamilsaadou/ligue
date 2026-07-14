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
    siteName: valueAsString(values.get('siteName'), DEFAULT_SITE_CONFIG.siteName),
    siteTagline: valueAsString(values.get('siteTagline'), DEFAULT_SITE_CONFIG.siteTagline),
    organizationName: valueAsString(
      values.get('organizationName'),
      DEFAULT_SITE_CONFIG.organizationName
    ),
    siteDescription: valueAsString(
      values.get('siteDescription'),
      DEFAULT_SITE_CONFIG.siteDescription
    ),
    supportEmail: valueAsString(values.get('supportEmail'), DEFAULT_SITE_CONFIG.supportEmail),
    supportPhone: valueAsString(values.get('supportPhone'), DEFAULT_SITE_CONFIG.supportPhone),
    siteLocation: valueAsString(values.get('siteLocation'), DEFAULT_SITE_CONFIG.siteLocation),
    emergencyNumber: valueAsString(
      values.get('emergencyNumber'),
      DEFAULT_SITE_CONFIG.emergencyNumber
    ),
    logoDataUrl:
      typeof values.get('logoDataUrl') === 'string' && values.get('logoDataUrl')
        ? (values.get('logoDataUrl') as string)
        : null
  };
};
