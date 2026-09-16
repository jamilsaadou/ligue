-- Create the default Cyber-Violentoscope diagnostic when it is missing.
-- This migration is idempotent and never replaces an existing diagnostic.
DO $migration$
DECLARE
    diagnostic_id TEXT := 'default-cyber-violentoscope-v1';
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
    "name": "Vie privée & Consentement en ligne",
    "slug": "vie-privee-consentement-en-ligne",
    "description": "Comportements protecteurs (zone « Je profite ») : leur absence augmente le score de risque.",
    "icon": "Lock",
    "questions": [
      {
        "text": "Il/elle respecte ma vie privée en ligne.",
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
            "text": "Rarement",
            "points": 2
          },
          {
            "text": "Jamais",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle me fait confiance et ne me demande pas d'explication sur mes communications.",
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
            "text": "Rarement",
            "points": 2
          },
          {
            "text": "Jamais",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle communique en ligne avec moi de manière respectueuse et non intrusive.",
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
            "text": "Rarement",
            "points": 2
          },
          {
            "text": "Jamais",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle me demande s'il peut me prendre en photo ou vidéo.",
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
            "text": "Rarement",
            "points": 2
          },
          {
            "text": "Jamais",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle me demande mon consentement pour sextoter ou m'envoyer un nude.",
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
            "text": "Rarement",
            "points": 2
          },
          {
            "text": "Jamais",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle supprime nos nudes et vidéos intimes après la rupture.",
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
            "text": "Rarement",
            "points": 2
          },
          {
            "text": "Jamais",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Surveillance & Contrôle des échanges",
    "slug": "surveillance-controle-echanges",
    "description": "Premiers signes de cyberviolence (zone « Je fais attention »).",
    "icon": "Eye",
    "questions": [
      {
        "text": "Il/elle surveille mes activités en ligne (dernières connexions, abonnements, publications, likes).",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle me dit ce que j'ai le droit de poster ou non sur les réseaux sociaux.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle m'empêche de répondre à mes SMS et appels.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle supprime des contacts sur mon téléphone, ou des abonnements sur mes réseaux sociaux.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle fouille mon téléphone.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Disponibilité, Réputation & Position",
    "slug": "disponibilite-reputation-position",
    "description": "Zone de danger (« Je me protège ») : contrôle de la disponibilité, atteintes à la réputation et à la localisation.",
    "icon": "MapPin",
    "questions": [
      {
        "text": "Il/elle exige que je sois joignable en permanence.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle diffuse des rumeurs sur moi sur les réseaux sociaux.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle m'humilie sur les réseaux sociaux.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle m'oblige à lui partager ma position.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Autonomie numérique & Intimidation",
    "slug": "autonomie-numerique-intimidation",
    "description": "Atteintes à l'autonomie numérique et comportements intimidants.",
    "icon": "AlertTriangle",
    "questions": [
      {
        "text": "Il/elle m'empêche de faire mes démarches administratives et judiciaires en ligne.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle usurpe mon identité en ligne.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle m'envoie des messages intimidants, rabaissants, insultants ou menaçants.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle me confisque mon téléphone, mon ordinateur, ma tablette…",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Codes, Comptes & Traçage",
    "slug": "codes-comptes-tracage",
    "description": "Contrôle des accès, des comptes et surveillance technologique.",
    "icon": "Smartphone",
    "questions": [
      {
        "text": "Il/elle exige que je lui donne mes codes de téléphone, réseaux sociaux, mails, comptes bancaires, etc.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle consulte et utilise mes comptes bancaires et administratifs sans mon accord.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle installe un logiciel espion de géolocalisation ou cache un traceur (AirTag) sur mon téléphone, ma voiture, dans les affaires de mes enfants.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle utilise les réseaux sociaux des enfants pour me surveiller ou me contacter.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Intimité numérique & Violences sexuelles",
    "slug": "intimite-numerique-violences-sexuelles",
    "description": "Diffusion intime non consentie, images sexuelles générées et contraintes sexuelles numériques.",
    "icon": "Shield",
    "questions": [
      {
        "text": "Il/elle menace, conserve ou diffuse des photos, vidéos et informations intimes sans mon consentement.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle fait des montages ou génère grâce à l'intelligence artificielle des images à caractère sexuel.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
          }
        ]
      },
      {
        "text": "Il/elle me force à filmer nos actes sexuels, ou à lui envoyer des nudes / photos / vidéos.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois",
            "points": 1
          },
          {
            "text": "Plusieurs fois",
            "points": 2
          },
          {
            "text": "Souvent / régulièrement",
            "points": 3
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
           OR "title" ILIKE 'Cyber-Violentoscope%'
           OR "title" ILIKE 'Cyber Violentoscope%'
    ) THEN
        RAISE NOTICE 'Le diagnostic Cyber-Violentoscope existe déjà, aucune insertion effectuée.';
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
        'Cyber-Violentoscope - Cyberviolences',
        'Un outil d''autodiagnostic pour repérer les cyberviolences dans le couple, des premiers signes au danger : vie privée, surveillance, traçage et intimité numérique. Ce questionnaire est confidentiel et anonyme.',
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

    RAISE NOTICE 'Diagnostic Cyber-Violentoscope créé avec % catégories, % questions et % options.',
        category_index,
        26,
        104;
END;
$migration$;
