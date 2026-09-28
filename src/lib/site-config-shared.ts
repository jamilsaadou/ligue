export type PublicSiteConfig = {
  siteName: string;
  siteTagline: string;
  organizationName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  clinicWhatsapp: string;
  clinicPsychologistPhone: string;
  clinicCaseManagerPhone: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;

  siteLocation: string;
  emergencyNumber: string;
  logoDataUrl: string | null;
};

export const DEFAULT_SITE_CONFIG: PublicSiteConfig = {
  siteName: 'ALERTE VIOLENCE',
  siteTagline: 'Diagnostiquer pour mieux protéger',
  organizationName: 'Ligue Nigérienne des Droits des Femmes (LNDF)',
  siteDescription:
    "Première plateforme numérique d'autodiagnostic des violences au Niger.",
  supportEmail: 'lndf.niger@gmail.com',
  supportPhone: '',
  clinicWhatsapp: '',
  clinicPsychologistPhone: '',
  clinicCaseManagerPhone: '',
  facebookUrl: 'https://www.facebook.com/LigueNigerienne/',
  instagramUrl: 'https://www.instagram.com/liguenigerienne',
  twitterUrl: 'https://x.com/LigueNigerienne',
  youtubeUrl: 'https://www.youtube.com/@liguenigerienne',

  siteLocation: 'Niamey, Niger',
  emergencyNumber: '17',
  logoDataUrl: '/brand/logo-ligue.png'
};
