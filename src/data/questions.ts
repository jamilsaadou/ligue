import {
  AlertTriangle,
  Eye,
  Heart,
  MessageCircle,
  Shield,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

export interface QuestionOption {
  text: string;
  points: number;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  maxPoints: number;
  questions: Question[];
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Respect & Confiance",
    slug: "respect-confiance",
    description: "Évaluez le niveau de respect et de confiance dans votre relation",
    icon: Heart,
    maxPoints: 15,
    questions: [
      {
        id: 1,
        text: "Respecte-t-il/elle vos décisions personnelles (choix de carrière, amis, loisirs) ?",
        options: [
          { text: "Toujours - soutient mes choix", points: 0 },
          { text: "Souvent, avec quelques remarques", points: 1 },
          { text: "Rarement - critique régulièrement mes choix", points: 2 },
          { text: "Jamais - impose ses décisions", points: 3 }
        ]
      },
      {
        id: 2,
        text: "Accepte-t-il/elle votre entourage (famille, amis) ?",
        options: [
          { text: "Oui, les apprécie et les respecte", points: 0 },
          { text: "Tolère mais fait des remarques négatives", points: 1 },
          { text: "Critique souvent ou évite de les voir", points: 2 },
          { text: "Interdit ou empêche de les voir", points: 3 }
        ]
      },
      {
        id: 3,
        text: "Vous fait-il/elle confiance ?",
        options: [
          { text: "Totalement, sans questionnement excessif", points: 0 },
          { text: "Généralement, mais pose parfois des questions", points: 1 },
          { text: "Méfiant(e), vérifie souvent mes dires", points: 2 },
          { text: "Aucune confiance, accusations constantes", points: 3 }
        ]
      },
      {
        id: 4,
        text: "Est-il/elle content(e) quand vous vous sentez épanoui(e) ?",
        options: [
          { text: "Oui, partage ma joie sincèrement", points: 0 },
          { text: "Parfois, mais peut sembler indifférent(e)", points: 1 },
          { text: "Rarement, minimise mes réussites", points: 2 },
          { text: "Non, semble agacé(e) par mon bonheur", points: 3 }
        ]
      },
      {
        id: 5,
        text: "S'assure-t-il/elle de votre accord pour ce que vous faites ensemble ?",
        options: [
          { text: "Toujours, demande mon avis", points: 0 },
          { text: "Souvent, mais décide parfois seul(e)", points: 1 },
          { text: "Rarement, prend les décisions sans me consulter", points: 2 },
          { text: "Jamais, impose tout", points: 3 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Communication & Contrôle",
    slug: "communication-controle",
    description: "Analysez la communication et les comportements de contrôle",
    icon: MessageCircle,
    maxPoints: 21,
    questions: [
      {
        id: 6,
        text: "Contrôle-t-il/elle vos sorties ?",
        options: [
          { text: "Non, je suis libre de mes mouvements", points: 0 },
          { text: "Demande où je vais, mais accepte", points: 1 },
          { text: "Exige de savoir où je suis à tout moment", points: 2 },
          { text: "M'interdit certaines sorties ou toutes", points: 3 }
        ]
      },
      {
        id: 7,
        text: "Fait-il/elle des remarques sur vos vêtements, maquillage, apparence ?",
        options: [
          { text: "Compliments sincères uniquement", points: 0 },
          { text: "Parfois des remarques mais respectueuses", points: 1 },
          { text: "Critique régulièrement mon apparence", points: 2 },
          { text: "Impose ce que je dois porter/comment paraître", points: 3 }
        ]
      },
      {
        id: 8,
        text: "Fouille-t-il/elle vos messages, emails ou téléphone ?",
        options: [
          { text: "Jamais, respecte mon intimité", points: 0 },
          { text: "A demandé une fois par curiosité", points: 1 },
          { text: "Vérifie régulièrement sans ma permission", points: 2 },
          { text: "Exige les mots de passe et surveille tout", points: 3 }
        ]
      },
      {
        id: 9,
        text: "Vous fait-il/elle du chantage si vous refusez quelque chose ?",
        options: [
          { text: "Jamais, accepte mes refus", points: 0 },
          { text: "Boude ou fait la tête", points: 1 },
          { text: "Menace de conséquences (rupture, etc.)", points: 2 },
          { text: "Chantage affectif ou matériel systématique", points: 3 }
        ]
      },
      {
        id: 10,
        text: "Est-il/elle jaloux(se) de manière excessive ?",
        options: [
          { text: "Non, fait confiance", points: 0 },
          { text: "Parfois un peu jaloux(se), mais raisonnable", points: 1 },
          { text: "Jaloux(se) fréquemment, fait des scènes", points: 2 },
          { text: "Possessif(ve) en permanence, accusations", points: 3 }
        ]
      },
      {
        id: 11,
        text: "Pouvez-vous exprimer librement votre désaccord ?",
        options: [
          { text: "Oui, on discute calmement", points: 0 },
          { text: "Parfois, mais ça crée des tensions", points: 1 },
          { text: "Difficilement, il/elle se met en colère", points: 2 },
          { text: "Impossible, j'ai peur de sa réaction", points: 3 }
        ]
      },
      {
        id: 12,
        text: "Respecte-t-il/elle vos moments de solitude ou avec d'autres ?",
        options: [
          { text: "Oui, encourage mon indépendance", points: 0 },
          { text: "Accepte mais préfère être toujours là", points: 1 },
          { text: "Fait des reproches quand je veux être seul(e)", points: 2 },
          { text: "Interdit d'avoir du temps sans lui/elle", points: 3 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Manipulation & Isolement",
    slug: "manipulation-isolement",
    description: "Identifiez les signes de manipulation et d'isolement",
    icon: Eye,
    maxPoints: 18,
    questions: [
      {
        id: 13,
        text: "Rabaisse-t-il/elle vos opinions ou vos projets ?",
        options: [
          { text: "Jamais, m'encourage", points: 0 },
          { text: "Parfois sceptique mais respectueux(se)", points: 1 },
          { text: "Critique souvent, dit que c'est irréaliste", points: 2 },
          { text: "Dénigre systématiquement, me décourage", points: 3 }
        ]
      },
      {
        id: 14,
        text: "Se moque-t-il/elle de vous devant d'autres personnes ?",
        options: [
          { text: "Jamais, me respecte en public", points: 0 },
          { text: "Taquineries légères et bienveillantes", points: 1 },
          { text: "Remarques humiliantes parfois", points: 2 },
          { text: "Humiliations répétées en public", points: 3 }
        ]
      },
      {
        id: 15,
        text: "Vous isole-t-il/elle de votre famille ou de vos proches ?",
        options: [
          { text: "Non, encourage ces liens", points: 0 },
          { text: "Préfère que je les voie moins", points: 1 },
          { text: "Critique mes proches pour m'en éloigner", points: 2 },
          { text: "M'a coupé(e) de mes proches", points: 3 }
        ]
      },
      {
        id: 16,
        text: "Vous manipule-t-il/elle émotionnellement ?",
        options: [
          { text: "Non, communication claire et honnête", points: 0 },
          { text: "Parfois fait culpabiliser un peu", points: 1 },
          { text: "Retourne souvent les situations contre moi", points: 2 },
          { text: "Manipulation constante, je doute de moi", points: 3 }
        ]
      },
      {
        id: 17,
        text: "Vous fait-il/elle douter de votre perception de la réalité ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Parfois minimise mes ressentis", points: 1 },
          { text: "Dit souvent que j'imagine des choses", points: 2 },
          { text: "Nie des faits évidents, me fait croire que je suis fou/folle", points: 3 }
        ]
      },
      {
        id: 18,
        text: "Contrôle-t-il/elle l'argent ou vos dépenses ?",
        options: [
          { text: "Non, gestion autonome ou équitable", points: 0 },
          { text: "Donne son avis mais je décide", points: 1 },
          { text: "Surveille mes dépenses, doit justifier", points: 2 },
          { text: "Contrôle total, dépendance financière", points: 3 }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Violences Psychologiques",
    slug: "violences-psychologiques",
    description: "Reconnaissez les signes de violence psychologique",
    icon: Shield,
    maxPoints: 21,
    questions: [
      {
        id: 19,
        text: "Vous humilie-t-il/elle ou vous traite-t-il/elle de 'folle/fou' quand vous exprimez vos émotions ?",
        options: [
          { text: "Jamais, écoute mes émotions", points: 0 },
          { text: "Parfois impatient(e) mais respectueux(se)", points: 1 },
          { text: "Minimise ou ridiculise mes émotions", points: 2 },
          { text: "M'insulte ou dit que je suis fou/folle", points: 3 }
        ]
      },
      {
        id: 20,
        text: "'Pète-t-il/elle les plombs' quand quelque chose lui déplaît ?",
        options: [
          { text: "Non, gère ses émotions", points: 0 },
          { text: "Parfois s'énerve mais se calme vite", points: 1 },
          { text: "Colères fréquentes et disproportionnées", points: 2 },
          { text: "Crises de rage, casse des objets, crie", points: 3 }
        ]
      },
      {
        id: 21,
        text: "Menace-t-il/elle de se suicider à cause de vous ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "A évoqué une fois de manière vague", points: 1 },
          { text: "Menace régulièrement si je veux partir", points: 2 },
          { text: "Chantage au suicide constant", points: 3 }
        ]
      },
      {
        id: 22,
        text: "Vous insulte-t-il/elle ou utilise-t-il/elle des mots blessants ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Rarement, s'excuse après", points: 1 },
          { text: "Régulièrement lors de disputes", points: 2 },
          { text: "Insultes fréquentes, langage dégradant", points: 3 }
        ]
      },
      {
        id: 23,
        text: "Vous fait-il/elle peur par son comportement ?",
        options: [
          { text: "Jamais, je me sens en sécurité", points: 0 },
          { text: "Parfois mal à l'aise", points: 1 },
          { text: "Souvent intimidé(e) par ses réactions", points: 2 },
          { text: "Peur constante, marche sur des œufs", points: 3 }
        ]
      },
      {
        id: 24,
        text: "Vous menace-t-il/elle directement ou indirectement ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Sous-entendus vagues parfois", points: 1 },
          { text: "Menaces voilées régulières", points: 2 },
          { text: "Menaces explicites (vous, vos proches, animaux)", points: 3 }
        ]
      },
      {
        id: 25,
        text: "Critique-t-il/elle constamment ce que vous faites ?",
        options: [
          { text: "Non, m'encourage", points: 0 },
          { text: "Parfois des remarques constructives", points: 1 },
          { text: "Critique fréquente, rien n'est jamais bien", points: 2 },
          { text: "Dénigrement systématique de tout", points: 3 }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Violences Physiques & Sexuelles",
    slug: "violences-physiques-sexuelles",
    description: "Identifiez les violences physiques et sexuelles",
    icon: AlertTriangle,
    maxPoints: 24,
    questions: [
      {
        id: 26,
        text: "Vous a-t-il/elle déjà poussé(e), tiré(e) ou bousculé(e) ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Une fois, par accident", points: 1 },
          { text: "Plusieurs fois lors de disputes", points: 3 },
          { text: "Régulièrement ou violemment", points: 4 }
        ]
      },
      {
        id: 27,
        text: "Vous a-t-il/elle déjà giflé(e), secoué(e) ou frappé(e) ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Une fois", points: 2 },
          { text: "Plusieurs fois", points: 3 },
          { text: "Régulièrement", points: 4 }
        ]
      },
      {
        id: 28,
        text: "Vous a-t-il/elle déjà étranglé(e) ou empêché(e) de respirer ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Une fois", points: 3 },
          { text: "Plusieurs fois", points: 4 },
          { text: "Régulièrement", points: 4 }
        ]
      },
      {
        id: 29,
        text: "Vous a-t-il/elle déjà menacé(e) avec un objet ou une arme ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Menace vague avec un objet", points: 2 },
          { text: "Menace directe avec un objet", points: 3 },
          { text: "Menace avec une arme", points: 4 }
        ]
      },
      {
        id: 30,
        text: "Vous touche-t-il/elle les parties intimes sans votre consentement ?",
        options: [
          { text: "Jamais, respecte mes limites", points: 0 },
          { text: "A insisté mais a respecté mon refus", points: 1 },
          { text: "Parfois sans attendre mon accord", points: 3 },
          { text: "Régulièrement sans mon consentement", points: 4 }
        ]
      },
      {
        id: 31,
        text: "Vous oblige-t-il/elle à avoir des relations sexuelles ?",
        options: [
          { text: "Jamais, respecte toujours mon consentement", points: 0 },
          { text: "Fait pression mais accepte mon refus", points: 2 },
          { text: "Insiste fortement, difficile de refuser", points: 3 },
          { text: "Force ou impose des relations", points: 4 }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Cyberviolences",
    slug: "cyberviolences",
    description: "Détectez les violences numériques et en ligne",
    icon: Smartphone,
    maxPoints: 21,
    questions: [
      {
        id: 32,
        text: "Insiste-t-il/elle pour que vous lui envoyiez des photos intimes ?",
        options: [
          { text: "Jamais demandé ou respecte mon refus", points: 0 },
          { text: "A demandé une fois, accepte mon refus", points: 1 },
          { text: "Insiste régulièrement", points: 2 },
          { text: "Fait pression ou menace si je refuse", points: 3 }
        ]
      },
      {
        id: 33,
        text: "Menace-t-il/elle de diffuser des photos intimes de vous ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Sous-entendu une fois", points: 2 },
          { text: "Menace parfois lors de disputes", points: 3 },
          { text: "Menace régulièrement ou l'a fait", points: 4 }
        ]
      },
      {
        id: 34,
        text: "Vous oblige-t-il/elle à regarder des contenus pornographiques ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Propose mais accepte mon refus", points: 1 },
          { text: "Insiste ou met mal à l'aise", points: 2 },
          { text: "Force ou impose", points: 3 }
        ]
      },
      {
        id: 35,
        text: "Surveille-t-il/elle vos activités sur les réseaux sociaux ?",
        options: [
          { text: "Non, respecte ma vie en ligne", points: 0 },
          { text: "Regarde parfois mon profil public", points: 1 },
          { text: "Vérifie régulièrement, pose des questions", points: 2 },
          { text: "Surveillance constante, accusations", points: 3 }
        ]
      },
      {
        id: 36,
        text: "Exige-t-il/elle vos mots de passe ou accès à vos comptes ?",
        options: [
          { text: "Jamais demandé", points: 0 },
          { text: "A demandé une fois, j'ai refusé", points: 1 },
          { text: "Insiste pour avoir accès", points: 2 },
          { text: "A pris mes mots de passe sans consentement", points: 3 }
        ]
      },
      {
        id: 37,
        text: "Vous harcèle-t-il/elle par messages (appels/SMS/réseaux sociaux) ?",
        options: [
          { text: "Communication normale et respectueuse", points: 0 },
          { text: "Envoie beaucoup de messages si je ne réponds pas vite", points: 1 },
          { text: "Bombardement de messages, s'énerve si pas de réponse", points: 2 },
          { text: "Harcèlement constant, menaces par messages", points: 3 }
        ]
      },
      {
        id: 38,
        text: "A-t-il/elle créé de faux profils ou vous espionne en ligne ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Je soupçonne mais pas sûr(e)", points: 1 },
          { text: "Oui, découvert une fois", points: 2 },
          { text: "Oui, régulièrement", points: 3 }
        ]
      }
    ]
  }
];

export interface AlertLevel {
  level: 'safe' | 'warning' | 'danger';
  title: string;
  subtitle: string;
  message: string;
  color: string;
  bgClass: string;
}

export const getAlertLevel = (score: number): AlertLevel => {
  if (score <= 15) {
    return {
      level: 'safe',
      title: 'Relation saine',
      subtitle: 'Profitez !',
      message: 'Votre relation semble saine et équilibrée. Continuez à cultiver le respect mutuel, la communication ouverte et la confiance.',
      color: '#64748b',
      bgClass: 'level-safe'
    };
  } else if (score <= 35) {
    return {
      level: 'warning',
      title: 'Vigilance',
      subtitle: 'Dis STOP !',
      message: 'Des signes préoccupants sont présents dans votre relation. Il est important d\'en parler et de poser des limites claires. N\'hésitez pas à consulter un professionnel.',
      color: '#eb5f2a',
      bgClass: 'level-warning'
    };
  } else {
    return {
      level: 'danger',
      title: 'Danger',
      subtitle: 'Protège-toi !',
      message: 'Vous subissez des violences. Ce n\'est PAS normal et ce n\'est PAS de votre faute. Protégez-vous et demandez de l\'aide immédiatement.',
      color: '#ef4444',
      bgClass: 'level-danger'
    };
  }
};

export const getCategoryLevel = (score: number, maxPoints: number): 'safe' | 'warning' | 'danger' => {
  const percentage = (score / maxPoints) * 100;
  if (percentage <= 25) return 'safe';
  if (percentage <= 60) return 'warning';
  return 'danger';
};

export const resources = [
  {
    country: "Niger",
    resources: [
      { name: "Ligue Nigérienne des Droits des Femmes (LNDF)", type: "Association", contact: "lndf.niger@gmail.com" },
      { name: "Ministère de la Promotion de la Femme", type: "Institution", contact: "+227 20 72 29 83" },
      { name: "Police Secours", type: "Urgence", contact: "17" }
    ]
  },
  {
    country: "Mali",
    resources: [
      { name: "AJM - Association des Juristes Maliennes", type: "Association", contact: "+223 20 22 49 95" },
      { name: "Police Secours", type: "Urgence", contact: "17" }
    ]
  },
  {
    country: "Burkina Faso",
    resources: [
      { name: "Association Voix de Femmes", type: "Association", contact: "+226 25 31 32 95" },
      { name: "Police Secours", type: "Urgence", contact: "17" }
    ]
  },
  {
    country: "Sénégal",
    resources: [
      { name: "AJS - Association des Juristes Sénégalaises", type: "Association", contact: "+221 33 824 42 09" },
      { name: "Police Secours", type: "Urgence", contact: "17" }
    ]
  },
  {
    country: "Côte d'Ivoire",
    resources: [
      { name: "AFJCI - Association des Femmes Juristes", type: "Association", contact: "+225 22 44 63 18" },
      { name: "Police Secours", type: "Urgence", contact: "110" }
    ]
  }
];
