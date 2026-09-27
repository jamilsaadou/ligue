import { PrismaClient, DiagnosticStatus, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: "Respect & Confiance",
    slug: "respect-confiance",
    description: "Évaluez le niveau de respect et de confiance dans votre relation",
    icon: "Heart",
    questions: [
      {
        text: "Respecte-t-il/elle vos décisions personnelles (choix de carrière, amis, loisirs) ?",
        options: [
          { text: "Toujours - soutient mes choix", points: 0 },
          { text: "Souvent, avec quelques remarques", points: 1 },
          { text: "Rarement - critique régulièrement mes choix", points: 2 },
          { text: "Jamais - impose ses décisions", points: 3 }
        ]
      },
      {
        text: "Accepte-t-il/elle votre entourage (famille, amis) ?",
        options: [
          { text: "Oui, les apprécie et les respecte", points: 0 },
          { text: "Tolère mais fait des remarques négatives", points: 1 },
          { text: "Critique souvent ou évite de les voir", points: 2 },
          { text: "Interdit ou empêche de les voir", points: 3 }
        ]
      },
      {
        text: "Vous fait-il/elle confiance ?",
        options: [
          { text: "Totalement, sans questionnement excessif", points: 0 },
          { text: "Généralement, mais pose parfois des questions", points: 1 },
          { text: "Méfiant(e), vérifie souvent mes dires", points: 2 },
          { text: "Aucune confiance, accusations constantes", points: 3 }
        ]
      },
      {
        text: "Est-il/elle content(e) quand vous vous sentez épanoui(e) ?",
        options: [
          { text: "Oui, partage ma joie sincèrement", points: 0 },
          { text: "Parfois, mais peut sembler indifférent(e)", points: 1 },
          { text: "Rarement, minimise mes réussites", points: 2 },
          { text: "Non, semble agacé(e) par mon bonheur", points: 3 }
        ]
      },
      {
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
    name: "Communication & Contrôle",
    slug: "communication-controle",
    description: "Analysez la communication et les comportements de contrôle",
    icon: "MessageCircle",
    questions: [
      {
        text: "Contrôle-t-il/elle vos sorties ?",
        options: [
          { text: "Non, je suis libre de mes mouvements", points: 0 },
          { text: "Demande où je vais, mais accepte", points: 1 },
          { text: "Exige de savoir où je suis à tout moment", points: 2 },
          { text: "M'interdit certaines sorties ou toutes", points: 3 }
        ]
      },
      {
        text: "Fait-il/elle des remarques sur vos vêtements, maquillage, apparence ?",
        options: [
          { text: "Compliments sincères uniquement", points: 0 },
          { text: "Parfois des remarques mais respectueuses", points: 1 },
          { text: "Critique régulièrement mon apparence", points: 2 },
          { text: "Impose ce que je dois porter/comment paraître", points: 3 }
        ]
      },
      {
        text: "Fouille-t-il/elle vos messages, emails ou téléphone ?",
        options: [
          { text: "Jamais, respecte mon intimité", points: 0 },
          { text: "A demandé une fois par curiosité", points: 1 },
          { text: "Vérifie régulièrement sans ma permission", points: 2 },
          { text: "Exige les mots de passe et surveille tout", points: 3 }
        ]
      },
      {
        text: "Vous fait-il/elle du chantage si vous refusez quelque chose ?",
        options: [
          { text: "Jamais, accepte mes refus", points: 0 },
          { text: "Boude ou fait la tête", points: 1 },
          { text: "Menace de conséquences (rupture, etc.)", points: 2 },
          { text: "Chantage affectif ou matériel systématique", points: 3 }
        ]
      },
      {
        text: "Est-il/elle jaloux(se) de manière excessive ?",
        options: [
          { text: "Non, fait confiance", points: 0 },
          { text: "Parfois un peu jaloux(se), mais raisonnable", points: 1 },
          { text: "Jaloux(se) fréquemment, fait des scènes", points: 2 },
          { text: "Possessif(ve) en permanence, accusations", points: 3 }
        ]
      },
      {
        text: "Pouvez-vous exprimer librement votre désaccord ?",
        options: [
          { text: "Oui, on discute calmement", points: 0 },
          { text: "Parfois, mais ça crée des tensions", points: 1 },
          { text: "Difficilement, il/elle se met en colère", points: 2 },
          { text: "Impossible, j'ai peur de sa réaction", points: 3 }
        ]
      },
      {
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
    name: "Manipulation & Isolement",
    slug: "manipulation-isolement",
    description: "Identifiez les signes de manipulation et d'isolement",
    icon: "Eye",
    questions: [
      {
        text: "Rabaisse-t-il/elle vos opinions ou vos projets ?",
        options: [
          { text: "Jamais, m'encourage", points: 0 },
          { text: "Parfois sceptique mais respectueux(se)", points: 1 },
          { text: "Critique souvent, dit que c'est irréaliste", points: 2 },
          { text: "Dénigre systématiquement, me décourage", points: 3 }
        ]
      },
      {
        text: "Se moque-t-il/elle de vous devant d'autres personnes ?",
        options: [
          { text: "Jamais, me respecte en public", points: 0 },
          { text: "Taquineries légères et bienveillantes", points: 1 },
          { text: "Remarques humiliantes parfois", points: 2 },
          { text: "Humiliations répétées en public", points: 3 }
        ]
      },
      {
        text: "Vous isole-t-il/elle de votre famille ou de vos proches ?",
        options: [
          { text: "Non, encourage ces liens", points: 0 },
          { text: "Préfère que je les voie moins", points: 1 },
          { text: "Critique mes proches pour m'en éloigner", points: 2 },
          { text: "M'a coupé(e) de mes proches", points: 3 }
        ]
      },
      {
        text: "Vous manipule-t-il/elle émotionnellement ?",
        options: [
          { text: "Non, communication claire et honnête", points: 0 },
          { text: "Parfois fait culpabiliser un peu", points: 1 },
          { text: "Retourne souvent les situations contre moi", points: 2 },
          { text: "Manipulation constante, je doute de moi", points: 3 }
        ]
      },
      {
        text: "Vous fait-il/elle douter de votre perception de la réalité ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Parfois minimise mes ressentis", points: 1 },
          { text: "Dit souvent que j'imagine des choses", points: 2 },
          { text: "Nie des faits évidents, me fait croire que je suis fou/folle", points: 3 }
        ]
      },
      {
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
    name: "Violences Psychologiques",
    slug: "violences-psychologiques",
    description: "Reconnaissez les signes de violence psychologique",
    icon: "Shield",
    questions: [
      {
        text: "Vous humilie-t-il/elle ou vous traite-t-il/elle de 'folle/fou' quand vous exprimez vos émotions ?",
        options: [
          { text: "Jamais, écoute mes émotions", points: 0 },
          { text: "Parfois impatient(e) mais respectueux(se)", points: 1 },
          { text: "Minimise ou ridiculise mes émotions", points: 2 },
          { text: "M'insulte ou dit que je suis fou/folle", points: 3 }
        ]
      },
      {
        text: "'Pète-t-il/elle les plombs' quand quelque chose lui déplaît ?",
        options: [
          { text: "Non, gère ses émotions", points: 0 },
          { text: "Parfois s'énerve mais se calme vite", points: 1 },
          { text: "Colères fréquentes et disproportionnées", points: 2 },
          { text: "Crises de rage, casse des objets, crie", points: 3 }
        ]
      },
      {
        text: "Menace-t-il/elle de se suicider à cause de vous ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "A évoqué une fois de manière vague", points: 1 },
          { text: "Menace régulièrement si je veux partir", points: 2 },
          { text: "Chantage au suicide constant", points: 3 }
        ]
      },
      {
        text: "Vous insulte-t-il/elle ou utilise-t-il/elle des mots blessants ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Rarement, s'excuse après", points: 1 },
          { text: "Régulièrement lors de disputes", points: 2 },
          { text: "Insultes fréquentes, langage dégradant", points: 3 }
        ]
      },
      {
        text: "Vous fait-il/elle peur par son comportement ?",
        options: [
          { text: "Jamais, je me sens en sécurité", points: 0 },
          { text: "Parfois mal à l'aise", points: 1 },
          { text: "Souvent intimidé(e) par ses réactions", points: 2 },
          { text: "Peur constante, marche sur des œufs", points: 3 }
        ]
      },
      {
        text: "Vous menace-t-il/elle directement ou indirectement ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Sous-entendus vagues parfois", points: 1 },
          { text: "Menaces voilées régulières", points: 2 },
          { text: "Menaces explicites (vous, vos proches, animaux)", points: 3 }
        ]
      },
      {
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
    name: "Violences Physiques & Sexuelles",
    slug: "violences-physiques-sexuelles",
    description: "Identifiez les violences physiques et sexuelles",
    icon: "AlertTriangle",
    questions: [
      {
        text: "Vous a-t-il/elle déjà poussé(e), tiré(e) ou bousculé(e) ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Une fois, par accident", points: 1 },
          { text: "Plusieurs fois lors de disputes", points: 3 },
          { text: "Régulièrement ou violemment", points: 4 }
        ]
      },
      {
        text: "Vous a-t-il/elle déjà giflé(e), secoué(e) ou frappé(e) ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Une fois", points: 2 },
          { text: "Plusieurs fois", points: 3 },
          { text: "Régulièrement", points: 4 }
        ]
      },
      {
        text: "Vous a-t-il/elle déjà étranglé(e) ou empêché(e) de respirer ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Une fois", points: 3 },
          { text: "Plusieurs fois", points: 4 },
          { text: "Régulièrement", points: 4 }
        ]
      },
      {
        text: "Vous a-t-il/elle déjà menacé(e) avec un objet ou une arme ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Menace vague avec un objet", points: 2 },
          { text: "Menace directe avec un objet", points: 3 },
          { text: "Menace avec une arme", points: 4 }
        ]
      },
      {
        text: "Vous touche-t-il/elle les parties intimes sans votre consentement ?",
        options: [
          { text: "Jamais, respecte mes limites", points: 0 },
          { text: "A insisté mais a respecté mon refus", points: 1 },
          { text: "Parfois sans attendre mon accord", points: 3 },
          { text: "Régulièrement sans mon consentement", points: 4 }
        ]
      },
      {
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
    name: "Cyberviolences",
    slug: "cyberviolences",
    description: "Détectez les violences numériques et en ligne",
    icon: "Smartphone",
    questions: [
      {
        text: "Insiste-t-il/elle pour que vous lui envoyiez des photos intimes ?",
        options: [
          { text: "Jamais demandé ou respecte mon refus", points: 0 },
          { text: "A demandé une fois, accepte mon refus", points: 1 },
          { text: "Insiste régulièrement", points: 2 },
          { text: "Fait pression ou menace si je refuse", points: 3 }
        ]
      },
      {
        text: "Menace-t-il/elle de diffuser des photos intimes de vous ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Sous-entendu une fois", points: 2 },
          { text: "Menace parfois lors de disputes", points: 3 },
          { text: "Menace régulièrement ou l'a fait", points: 4 }
        ]
      },
      {
        text: "Vous oblige-t-il/elle à regarder des contenus pornographiques ?",
        options: [
          { text: "Jamais", points: 0 },
          { text: "Propose mais accepte mon refus", points: 1 },
          { text: "Insiste ou met mal à l'aise", points: 2 },
          { text: "Force ou impose", points: 3 }
        ]
      },
      {
        text: "Surveille-t-il/elle vos activités sur les réseaux sociaux ?",
        options: [
          { text: "Non, respecte ma vie en ligne", points: 0 },
          { text: "Regarde parfois mon profil public", points: 1 },
          { text: "Vérifie régulièrement, pose des questions", points: 2 },
          { text: "Surveillance constante, accusations", points: 3 }
        ]
      },
      {
        text: "Exige-t-il/elle vos mots de passe ou accès à vos comptes ?",
        options: [
          { text: "Jamais demandé", points: 0 },
          { text: "A demandé une fois, j'ai refusé", points: 1 },
          { text: "Insiste pour avoir accès", points: 2 },
          { text: "A pris mes mots de passe sans consentement", points: 3 }
        ]
      },
      {
        text: "Vous harcèle-t-il/elle par messages (appels/SMS/réseaux sociaux) ?",
        options: [
          { text: "Communication normale et respectueuse", points: 0 },
          { text: "Envoie beaucoup de messages si je ne réponds pas vite", points: 1 },
          { text: "Bombardement de messages, s'énerve si pas de réponse", points: 2 },
          { text: "Harcèlement constant, menaces par messages", points: 3 }
        ]
      },
      {
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

const resources = [
  {
    country: { name: "Niger", code: "NE", emergencyNumber: "17" },
    resources: [
      { name: "Ligue Nigérienne des Droits des Femmes (LNDF)", type: "association" as ResourceType, contact: "lndf.niger@gmail.com" },
      { name: "Ministère de la Promotion de la Femme", type: "institution" as ResourceType, contact: "+227 20 72 29 83" },
      { name: "Police Secours", type: "urgence" as ResourceType, contact: "17" }
    ]
  }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Check if diagnostic already exists
  const existingDiagnostic = await prisma.diagnostic.findFirst({
    where: { status: 'active' }
  });

  if (existingDiagnostic) {
    console.log('⚠️  Un diagnostic actif existe déjà. Suppression et recréation...');
    await prisma.diagnostic.delete({ where: { id: existingDiagnostic.id } });
  }

  // Create the diagnostic
  const diagnostic = await prisma.diagnostic.create({
    data: {
      title: "Violentomètre - Évaluez votre relation",
      description: "Un outil d'autodiagnostic pour identifier les signes de violence dans une relation. Ce questionnaire est confidentiel et anonyme.",
      status: DiagnosticStatus.active,
      version: 1,
      categories: {
        create: categories.map((category, categoryIndex) => ({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          sortOrder: categoryIndex,
          questions: {
            create: category.questions.map((question, questionIndex) => ({
              text: question.text,
              sortOrder: questionIndex,
              options: {
                create: question.options.map((option, optionIndex) => ({
                  text: option.text,
                  points: option.points,
                  sortOrder: optionIndex
                }))
              }
            }))
          }
        }))
      }
    }
  });

  console.log(`✅ Diagnostic créé: ${diagnostic.id}`);

  // Seed resources
  console.log('🌍 Création des ressources par pays...');

  for (const item of resources) {
    const country = await prisma.country.upsert({
      where: { code: item.country.code },
      update: {
        name: item.country.name,
        emergencyNumber: item.country.emergencyNumber
      },
      create: {
        name: item.country.name,
        code: item.country.code,
        emergencyNumber: item.country.emergencyNumber
      }
    });

    for (const resource of item.resources) {
      await prisma.resource.create({
        data: {
          countryId: country.id,
          name: resource.name,
          type: resource.type,
          contact: resource.contact
        }
      });
    }

    console.log(`  ✅ ${item.country.name}: ${item.resources.length} ressources`);
  }

  console.log('');
  console.log('🎉 Seeding terminé avec succès!');
  console.log(`   - 1 diagnostic avec ${categories.length} catégories`);
  console.log(`   - ${categories.reduce((acc, cat) => acc + cat.questions.length, 0)} questions`);
  console.log(`   - ${resources.length} pays avec leurs ressources`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
