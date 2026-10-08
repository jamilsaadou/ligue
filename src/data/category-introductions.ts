export const diagnosticReassurance = 'Prenez votre temps. Vous pouvez vous arrêter à tout moment, revenir en arrière, ou fermer la page. Vos réponses sont anonymes et ne sont jamais enregistrées avec votre identité.';

export const diagnosticDefinitions = [
  { title: 'Cyberviolences', definition: 'Violences commises ou amplifiées par les outils numériques en raison du sexe ou du genre : harcèlement, menaces, insultes sexistes, surveillance ou diffusion d’images intimes sans consentement. Elles prolongent les violences hors ligne et servent à contrôler, intimider, humilier ou réduire au silence.', matches: ['cyber', 'en ligne', 'numerique'] },
  { title: 'Harcèlement', definition: 'Paroles, messages, gestes, pressions ou comportements intrusifs répétés qui portent atteinte à la dignité, à la sécurité ou à la liberté d’une personne. Le harcèlement crée un climat intimidant ou humiliant et peut servir à exercer un pouvoir ou un contrôle, au travail, dans la rue, en famille, dans le couple ou en ligne.', matches: ['harcel'] },
  { title: 'Violences économiques', definition: 'Comportements qui contrôlent, limitent ou privent une personne de ses ressources pour la maintenir dans la dépendance : empêcher de travailler, confisquer des revenus, bloquer l’accès à un compte ou imposer des dettes. Ils réduisent l’autonomie et peuvent empêcher de quitter une relation violente.', matches: ['economique', 'financi'] },
  { title: 'Climat incestuel', definition: 'Climat familial où les limites entre adultes et enfants, les rôles et l’intimité ne sont pas respectés : confidences sexuelles inappropriées, intrusion dans l’intimité ou sexualisation de la relation. Il peut exister sans contact sexuel et porter atteinte à l’autonomie, à la sécurité et au développement de l’enfant.', matches: ['incestuel', 'incestometre'] },
  { title: 'Violences', definition: 'Actes, menaces, pressions ou privations qui portent atteinte à l’intégrité physique, sexuelle, psychologique, économique ou sociale d’une personne. Les violences peuvent s’inscrire dans des rapports de pouvoir et de domination liés au genre, dans le couple, la famille, au travail, dans l’espace public ou en ligne.', matches: ['violentometre'] },
];

const normalizeName = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function getDiagnosticDefinition(name: string) {
  const normalized = normalizeName(name);
  return diagnosticDefinitions.find((item) =>
    normalized === normalizeName(item.title)
    || item.matches.some((word) => normalized.includes(word))
  )?.definition;
}

export const categoryIntroductions = [
  { title: 'Violences sexuelles', definition: 'Tout acte à caractère sexuel imposé sans consentement libre et éclairé — attouchement, rapport forcé, pression, ou chantage à caractère sexuel.', matches: ['sexuell'] },
  { title: 'Violences en ligne', definition: diagnosticDefinitions[0].definition, matches: ['en ligne', 'cyber', 'numerique'] },
  { title: 'Violences familiales', definition: 'Contrôle, violence physique, humiliation, exploitation ou privation exercés par un membre de la famille ou du foyer.', matches: ['familial', 'famille'] },
  { title: 'Violences conjugales', definition: 'Comportements de contrôle, menaces, violence physique ou psychologique exercés par un partenaire ou ex-partenaire.', matches: ['conjugal'] },
  { title: 'Violences économiques', definition: diagnosticDefinitions[2].definition, matches: ['economique', 'financi'] },
  { title: 'Violences psychologiques', definition: 'Insultes, humiliations, manipulation, dévalorisation ou menaces répétées qui atteignent l’estime de soi et le bien-être mental.', matches: ['psychologique', 'manipulation', 'isolement'] },
  { title: 'Amitiés toxiques', definition: 'Relations amicales marquées par le contrôle, la manipulation, la culpabilisation ou l’isolement progressif.', matches: ['amitie', 'amical'] },
  { title: 'Inceste', definition: 'Relation ou contact à caractère sexuel imposé par un membre de la famille ou une personne en position d’autorité familiale, quel que soit l’âge de la personne concernée.', matches: ['inceste'] },
];

export function getCategoryDefinition(name: string, description?: string) {
  const normalized = normalizeName(name);
  return getDiagnosticDefinition(name)
    || categoryIntroductions.find((category) => category.matches.some((word) => normalized.includes(word)))?.definition
    || description || 'Des repères pour mieux comprendre les comportements vécus dans cette situation.';
}
