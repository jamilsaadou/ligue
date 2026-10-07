export const diagnosticReassurance = 'Prenez votre temps. Vous pouvez vous arrêter à tout moment, revenir en arrière, ou fermer la page. Vos réponses sont anonymes et ne sont jamais enregistrées avec votre identité.';

export const categoryIntroductions = [
  { title: 'Violences sexuelles', definition: 'Tout acte à caractère sexuel imposé sans consentement libre et éclairé — attouchement, rapport forcé, pression, ou chantage à caractère sexuel.', matches: ['sexuell'] },
  { title: 'Violences en ligne', definition: 'Harcèlement, contrôle, menaces ou pressions à caractère sexuel exercés via le téléphone, les réseaux sociaux ou internet.', matches: ['en ligne', 'cyber', 'numerique'] },
  { title: 'Violences familiales', definition: 'Contrôle, violence physique, humiliation, exploitation ou privation exercés par un membre de la famille ou du foyer.', matches: ['familial', 'famille'] },
  { title: 'Violences conjugales', definition: 'Comportements de contrôle, menaces, violence physique ou psychologique exercés par un partenaire ou ex-partenaire.', matches: ['conjugal'] },
  { title: 'Violences économiques', definition: 'Contrôle, privation ou exploitation liés à l’argent, au travail, ou aux biens, empêchant l’autonomie financière d’une personne.', matches: ['economique', 'financi'] },
  { title: 'Violences psychologiques', definition: 'Insultes, humiliations, manipulation, dévalorisation ou menaces répétées qui atteignent l’estime de soi et le bien-être mental.', matches: ['psychologique', 'manipulation', 'isolement'] },
  { title: 'Amitiés toxiques', definition: 'Relations amicales marquées par le contrôle, la manipulation, la culpabilisation ou l’isolement progressif.', matches: ['amitie', 'amical'] },
  { title: 'Inceste', definition: 'Relation ou contact à caractère sexuel imposé par un membre de la famille ou une personne en position d’autorité familiale, quel que soit l’âge de la personne concernée.', matches: ['inceste'] },
];

export function getCategoryDefinition(name: string, description?: string) {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return categoryIntroductions.find((category) => category.matches.some((word) => normalized.includes(word)))?.definition
    || description || 'Des repères pour mieux comprendre les comportements vécus dans cette situation.';
}
