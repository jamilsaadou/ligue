-- Create the default Incestomètre diagnostic when it is missing.
-- This migration is idempotent and never replaces an existing diagnostic.
DO $migration$
DECLARE
    diagnostic_id TEXT := 'default-incestometre-v1';
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
    "name": "Écoute, Bienveillance & Liens extérieurs",
    "slug": "ecoute-bienveillance-liens-exterieurs",
    "description": "Comportements protecteurs (zone « Profite ») : plus ils sont absents, plus le score de risque augmente.",
    "icon": "MessageCircle",
    "questions": [
      {
        "text": "Tes proches sont à l’écoute et favorisent le dialogue.",
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
        "text": "Tes proches sont bienveillants avec toi sans rien attendre en retour.",
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
        "text": "Tes proches respectent tes amitiés et tes relations extérieures.",
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
    "name": "Affection, Intimité & Information",
    "slug": "affection-intimite-information",
    "description": "Comportements protecteurs : affection consentie, droit à l’intimité et information adaptée à l’âge.",
    "icon": "HandHeart",
    "questions": [
      {
        "text": "Tes proches te montrent l’affection dont tu as envie.",
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
        "text": "Tu as le droit à ton intimité.",
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
        "text": "Tes proches te donnent des informations claires et adaptées à ton âge sur ton corps, ton intimité et ta sexualité.",
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
    "name": "Intrusions, Isolement & Banalisation des violences",
    "slug": "intrusions-isolement-banalisation",
    "description": "Signaux de vigilance : début du climat incestuel.",
    "icon": "Eye",
    "questions": [
      {
        "text": "Tes proches posent des questions intrusives qui te mettent mal à l’aise.",
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
        "text": "Tes proches cherchent à passer du temps seul·e avec toi et éloignent les autres.",
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
        "text": "Tes proches te racontent des faits d’inceste / incestuels survenus dans la famille sans les qualifier de tels.",
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
        "text": "Tes proches soutiennent la culture du viol, en banalisant les violences sexuelles ou en prenant la défense des agresseurs.",
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
    "name": "Intimité, Sexualisation & Secrets",
    "slug": "intimite-sexualisation-secrets",
    "description": "Intrusions dans l’espace personnel et la pudeur, remarques sexualisées et confidences non adaptées.",
    "icon": "Lock",
    "questions": [
      {
        "text": "Tes proches ne respectent pas ton espace personnel, ton intimité.",
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
        "text": "Tes proches font des remarques ambiguës et sexualisées sur ton apparence.",
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
        "text": "Tes proches font des blagues sexuelles devant toi ou t’offrent des objets à caractère sexuel.",
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
        "text": "Ta pudeur et ton intimité ne sont pas respectées (portes qui ne ferment pas à la salle de bain, aux WC, etc.).",
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
        "text": "Tes proches se promènent nu·e·s ou s’exhibent devant toi.",
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
        "text": "Tes proches se confient régulièrement sur des sujets non adaptés (problèmes de couple, sexualité, etc.) et tu es contraint·e de garder des secrets.",
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
    "name": "Gestes imposés & Exposition sexuelle",
    "slug": "gestes-imposes-exposition-sexuelle",
    "description": "Zone « Demande de l’aide » : ces situations justifient de chercher du soutien quand tu es mal à l’aise.",
    "icon": "AlertTriangle",
    "questions": [
      {
        "text": "Il / elle t’impose des gestes affectueux que tu ne souhaites pas (bisous, chatouilles, caresses).",
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
        "text": "Il / elle t’impose des gestes abusifs sous couvert d’hygiène ou de soin (toilette prolongée, massages débordants, etc.).",
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
        "text": "Il / elle t’impose de dormir dans son lit, y compris jusqu’à un âge avancé.",
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
        "text": "Il / elle te photographie nu·e ou dévêtu·e.",
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
        "text": "Il / elle t’expose à des films pornographiques ou à des actes sexuels.",
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
        "text": "Il / elle t’embrasse sur la bouche, y compris à l’âge adulte.",
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
    "name": "Agressions sexuelles & Viol",
    "slug": "agressions-sexuelles-viol",
    "description": "Zone « Demande de l’aide » : toute réponse positive à ces items doit être prise au sérieux.",
    "icon": "Shield",
    "questions": [
      {
        "text": "Il / elle touche tes parties intimes (sexe, fesses, seins, bouche) : le document source qualifie cela d’agression sexuelle.",
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
        "text": "Il / elle t’impose des relations sexuelles : le document source qualifie cela de viol.",
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
           OR "title" ILIKE 'Incestomètre%'
           OR "title" ILIKE 'Incestometre%'
    ) THEN
        RAISE NOTICE 'Le diagnostic Incestomètre existe déjà, aucune insertion effectuée.';
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
        'Incestomètre - Repérer un climat incestuel',
        'Un outil d''autodiagnostic inspiré du Violentomètre contre l''inceste, pour repérer les comportements protecteurs, le climat incestuel et les situations qui justifient de demander de l''aide. Ce questionnaire est confidentiel et anonyme.',
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

    RAISE NOTICE 'Diagnostic Incestomètre créé avec % catégories, % questions et % options.',
        category_index,
        24,
        96;
END;
$migration$;
