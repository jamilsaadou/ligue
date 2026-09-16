-- Create the default Harcélomètre diagnostic when it is missing.
-- This migration is idempotent and never replaces an existing diagnostic.
DO $migration$
DECLARE
    diagnostic_id TEXT := 'default-harcelometre-v1';
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
    "name": "Respect & Bien-être",
    "slug": "respect-bien-etre",
    "description": "Évaluez les comportements protecteurs : plus ils sont absents, plus le score de risque augmente.",
    "icon": "HandHeart",
    "questions": [
      {
        "text": "Cette personne respecte mes goûts, mes besoins et mes choix.",
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
        "text": "Cette personne me permet d’être à l’aise quand je suis avec elle.",
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
        "text": "Cette personne est contente pour moi lorsque je me sens épanoui(e).",
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
    "name": "Passivité & Critiques",
    "slug": "passivite-critiques",
    "description": "La répétition d’un comportement inacceptable indique une situation de harcèlement.",
    "icon": "MessageCircle",
    "questions": [
      {
        "text": "Cette personne reste passive ou ne réagit pas lorsque j’ai besoin d’aide.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      },
      {
        "text": "Cette personne me critique et me juge en permanence.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Exclusion & Moqueries",
    "slug": "exclusion-moqueries",
    "description": "La répétition d’un comportement inacceptable indique une situation de harcèlement.",
    "icon": "UserX",
    "questions": [
      {
        "text": "Cette personne m’exclut ou me met volontairement à l’écart.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      },
      {
        "text": "Cette personne se moque de moi ou me donne des surnoms méchants.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Rumeurs & Humiliations",
    "slug": "rumeurs-humiliations",
    "description": "La répétition d’un comportement inacceptable indique une situation de harcèlement.",
    "icon": "Users",
    "questions": [
      {
        "text": "Cette personne lance des rumeurs sur moi.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      },
      {
        "text": "Cette personne me fait des coups bas, m’humilie en public ou m’insulte.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Cyberharcèlement & Coercition",
    "slug": "cyberharcelement-coercition",
    "description": "La répétition d’un comportement inacceptable indique une situation de harcèlement.",
    "icon": "Smartphone",
    "questions": [
      {
        "text": "Cette personne publie des choses qui me rabaissent sur les réseaux sociaux.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      },
      {
        "text": "Cette personne me force à faire des choses dont je n’ai pas envie, me fait du chantage ou me menace.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      }
    ]
  },
  {
    "name": "Atteintes aux biens & Violences",
    "slug": "atteintes-biens-violences",
    "description": "Un seul événement grave (racket, violence) peut suffire à indiquer un danger.",
    "icon": "AlertTriangle",
    "questions": [
      {
        "text": "Cette personne me vole, détériore mes affaires et/ou me rackette.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
            "points": 3
          }
        ]
      },
      {
        "text": "Cette personne me bouscule violemment, me frappe ou m’agresse sexuellement.",
        "options": [
          {
            "text": "Jamais",
            "points": 0
          },
          {
            "text": "Une fois ou rarement",
            "points": 1
          },
          {
            "text": "Cela se répète",
            "points": 2
          },
          {
            "text": "Souvent",
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
           OR "title" ILIKE 'Harcélomètre%'
           OR "title" ILIKE 'Harcelometre%'
    ) THEN
        RAISE NOTICE 'Le diagnostic Harcélomètre existe déjà, aucune insertion effectuée.';
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
        'Harcélomètre - Repérer le harcèlement',
        'Un outil d''autodiagnostic pour repérer les comportements sains, préoccupants et les situations de harcèlement. Ce questionnaire est confidentiel et anonyme.',
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

    RAISE NOTICE 'Diagnostic Harcélomètre créé avec % catégories, % questions et % options.',
        category_index,
        13,
        52;
END;
$migration$;
