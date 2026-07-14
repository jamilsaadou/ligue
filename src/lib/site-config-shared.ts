export type PublicSiteConfig = {
  siteName: string;
  siteTagline: string;
  organizationName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  siteLocation: string;
  emergencyNumber: string;
  logoDataUrl: string | null;
};

export const DEFAULT_SITE_CONFIG: PublicSiteConfig = {
  siteName: 'ALERTE VIOLENCE',
  siteTagline: 'Diagnostiquer pour mieux protéger',
  organizationName: 'Ligue Nigérienne des Droits des Femmes (LNDF)',
  siteDescription:
    "Première plateforme numérique d'autodiagnostic des violences en Afrique de l'Ouest.",
  supportEmail: 'lndf.niger@gmail.com',
  supportPhone: '',
  siteLocation: 'Niamey, Niger',
  emergencyNumber: '17',
  logoDataUrl: null
};
