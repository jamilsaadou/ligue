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

// Priorité à l'Afrique de l'Ouest et centrale (cœur de cible de la plateforme),
// puis quelques pays fréquents pour la diaspora.
export const COUNTRIES: Country[] = [
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinée-Bissau', dialCode: '+245', flag: '🇬🇼' },
  { code: 'MR', name: 'Mauritanie', dialCode: '+222', flag: '🇲🇷' },
  { code: 'GM', name: 'Gambie', dialCode: '+220', flag: '🇬🇲' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigéria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'TD', name: 'Tchad', dialCode: '+235', flag: '🇹🇩' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'RD Congo', dialCode: '+243', flag: '🇨🇩' },
  { code: 'CF', name: 'Centrafrique', dialCode: '+236', flag: '🇨🇫' },
  { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' }
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
