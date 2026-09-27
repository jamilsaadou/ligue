// Données partagées pour l'onboarding et l'espace compte :
// - liste de pays avec leur indicatif téléphonique (l'indicatif doit concorder
//   avec le pays sélectionné) ;
// - motifs d'inscription proposés sous forme de cases à cocher.

export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dialCode: string; // indicatif international, ex. "+227"
  flag: string; // emoji drapeau
};

// La plateforme accompagne les personnes au Niger.
export const COUNTRIES: Country[] = [
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' }
];

export const findCountry = (code: string | null | undefined): Country | undefined =>
  code ? COUNTRIES.find((country) => country.code === code) : undefined;

export type JoinReason = {
  id: string;
  label: string;
};

export const JOIN_REASONS: JoinReason[] = [
  { id: 'self_assessment', label: 'Évaluer ma propre situation' },
  { id: 'help_relative', label: 'Aider un proche' },
  { id: 'find_resources', label: "Trouver des ressources et de l'aide" },
  { id: 'professional', label: 'Je suis un·e professionnel·le / accompagnant·e' },
  { id: 'awareness', label: 'Me sensibiliser / m’informer' },
  { id: 'other', label: 'Autre' }
];

export const JOIN_REASON_IDS = JOIN_REASONS.map((reason) => reason.id);

export const joinReasonLabel = (id: string): string =>
  JOIN_REASONS.find((reason) => reason.id === id)?.label ?? id;
