-- Create the default Haromètre des violences économiques diagnostic when missing.
-- This migration is idempotent and never replaces an existing diagnostic.
DO $migration$
DECLARE
    diagnostic_id TEXT := 'default-harometre-eco-v1';
    category_id TEXT;
    question_id TEXT;
    option_id TEXT;
    category_index INTEGER := 0;
    question_index INTEGER;
    option_index INTEGER;
    category_record JSONB;
    question_record JSONB;
    option_record JSONB;
    diagnostic_data JSONB := $diagnostic_json$
[
  {
    "name": "Autonomie & Équité",
    "slug": "autonomie-equite",
    "description": "Comportements protecteurs (zone « Profitez ») : leur absence augmente le score de risque.",
    "icon": "Scale",
    "questions": [
      {
        "text": "Avez tous les deux une autonomie financière.",
        "options": [
          {
            "text": "Toujours",
            "points": 0
          },
          {
            "text": "Souvent",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Rarement",
            "points": 3
          },
          {
            "text": "Jamais",
            "points": 4
          }
        ]
      },
      {
        "text": "Contribuez au budget proportionnellement à vos revenus.",
        "options": [
          {
            "text": "Toujours",
            "points": 0
          },
          {
            "text": "Souvent",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Rarement",
            "points": 3
          },
          {
            "text": "Jamais",
            "points": 4
          }
        ]
      },
      {
        "text": "Prenez les décisions financières à deux.",
        "options": [
          {
            "text": "Toujours",
            "points": 0
          },
          {
            "text": "Souvent",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Rarement",
            "points": 3
          },
          {
            "text": "Jamais",
            "points": 4
          }
        ]
      },
      {
        "text": "Êtes à l’aise de discuter d’argent avec votre partenaire.",
        "options": [
          {
            "text": "Toujours",
            "points": 0
          },
          {
            "text": "Souvent",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Rarement",
            "points": 3
          },
          {
            "text": "Jamais",
            "points": 4
          }
        ]
      },
      {
        "text": "Répartissez équitablement le paiement des impôts.",
        "options": [
          {
            "text": "Toujours",
            "points": 0
          },
          {
            "text": "Souvent",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Rarement",
            "points": 3
          },
          {
            "text": "Jamais",
            "points": 4
          }
        ]
      }
    ]
  },
  {
    "name": "Pressions & Déséquilibres",
    "slug": "pressions-desequilibres",
    "description": "Signaux de vigilance : pressions et déséquilibres dans la gestion de l’argent du couple.",
    "icon": "AlertTriangle",
    "questions": [
      {
        "text": "Ne vous propose pas de compenser un bien qu’il/elle a endommagé.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Insiste pour que vous fassiez 50/50 sur le budget, alors qu’il/elle gagne plus que vous.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Vous contraint à un contrat de mariage qui vous désavantage.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Gère seul(e) l’épargne du ménage sans vous informer.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Dépense pour lui/elle de l’argent consacré au foyer / aux enfants.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      }
    ]
  },
  {
    "name": "Emploi & Revenus",
    "slug": "emploi-revenus",
    "description": "Signaux de vigilance : entraves à l’emploi et aux revenus.",
    "icon": "Target",
    "questions": [
      {
        "text": "Refuse d’utiliser une partie de ses revenus pour le budget du foyer.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "S’oppose à ce que vous occupiez un emploi mieux rémunéré que le sien.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Insiste pour que vous ne travailliez pas ou à temps partiel afin de diminuer les impôts du couple.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Insiste pour que toutes les factures soient mises à votre nom.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Vous incite à vendre un bien qui vous appartient pour financer le quotidien.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      }
    ]
  },
  {
    "name": "Contrôle & Endettement",
    "slug": "controle-endettement",
    "description": "Zone « Protégez-vous » : contrôle des dépenses et endettement imposé.",
    "icon": "Lock",
    "questions": [
      {
        "text": "Contrôle vos dépenses, tout en vous cachant les siennes.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Contracte des dettes en commun sans vous en informer.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "S’oppose à ce que vous preniez un travail.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "S’oppose à ce que vous ayez un compte bancaire personnel.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      }
    ]
  },
  {
    "name": "Privation & Captation",
    "slug": "privation-captation",
    "description": "Zone « Protégez-vous » : privation et captation de vos ressources.",
    "icon": "Eye",
    "questions": [
      {
        "text": "Ne paye pas ou plus la pension alimentaire.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Saisit l’argent que vos enfants devaient recevoir.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Vous pousse à travailler pour son activité à titre gratuit ou en dessous du marché.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Bloque vos cartes bancaires sans vous le dire.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      },
      {
        "text": "Saisit tout ou partie de vos revenus.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Rarement",
            "points": 1
          },
          {
            "text": "Parfois",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          },
          {
            "text": "Toujours",
            "points": 4
          }
        ]
      }
    ]
  }
]
$diagnostic_json$::JSONB;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Diagnostic"
        WHERE "id" = diagnostic_id
           OR "title" ILIKE 'Haromètre%'
           OR "title" ILIKE 'Harometre%'
    ) THEN
        RAISE NOTICE 'Le diagnostic Haromètre existe déjà, aucune insertion effectuée.';
        RETURN;
    END IF;

    INSERT INTO "Diagnostic" (
        "id",
        "title",
        "description",
        "status",
        "version",
        "createdAt",
        "updatedAt"
    ) VALUES (
        diagnostic_id,
        'Haromètre - Violences économiques',
        'Un outil d''autodiagnostic pour repérer les violences économiques dans le couple : autonomie, pressions, contrôle et privation. Ce questionnaire est confidentiel et anonyme.',
        'active'::"DiagnosticStatus",
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

    FOR category_record IN
        SELECT value FROM jsonb_array_elements(diagnostic_data)
    LOOP
        category_index := category_index + 1;
        category_id := diagnostic_id || '-c-' || LPAD(category_index::TEXT, 2, '0');

        INSERT INTO "DiagnosticCategory" (
            "id",
            "diagnosticId",
            "name",
            "slug",
            "description",
            "icon",
            "sortOrder",
            "createdAt",
            "updatedAt"
        ) VALUES (
            category_id,
            diagnostic_id,
            category_record->>'name',
            category_record->>'slug',
            category_record->>'description',
            category_record->>'icon',
            category_index - 1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        question_index := 0;
        FOR question_record IN
            SELECT value FROM jsonb_array_elements(category_record->'questions')
        LOOP
            question_index := question_index + 1;
            question_id := category_id || '-q-' || LPAD(question_index::TEXT, 2, '0');

            INSERT INTO "DiagnosticQuestion" (
                "id",
                "categoryId",
                "text",
                "sortOrder",
                "createdAt",
                "updatedAt"
            ) VALUES (
                question_id,
                category_id,
                question_record->>'text',
                question_index - 1,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );

            option_index := 0;
            FOR option_record IN
                SELECT value FROM jsonb_array_elements(question_record->'options')
            LOOP
                option_index := option_index + 1;
                option_id := question_id || '-o-' || LPAD(option_index::TEXT, 2, '0');

                INSERT INTO "DiagnosticOption" (
                    "id",
                    "questionId",
                    "text",
                    "points",
                    "sortOrder",
                    "createdAt",
                    "updatedAt"
                ) VALUES (
                    option_id,
                    question_id,
                    option_record->>'text',
                    (option_record->>'points')::INTEGER,
                    option_index - 1,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );
            END LOOP;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Diagnostic Haromètre créé avec % catégories, % questions et % options.',
        category_index,
        24,
        120;
END;
$migration$;
