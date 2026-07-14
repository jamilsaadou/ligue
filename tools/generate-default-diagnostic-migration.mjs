import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const seedPath = path.join(projectRoot, 'prisma', 'seed.ts');
const migrationDirectory = path.join(
  projectRoot,
  'prisma',
  'migrations',
  '20260714230000_seed_default_violentometre'
);
const migrationPath = path.join(migrationDirectory, 'migration.sql');

const seedSource = fs.readFileSync(seedPath, 'utf8');
const categoriesMatch = seedSource.match(
  /const categories = (\[[\s\S]*?\n\]);\n\nconst resources =/
);

if (!categoriesMatch) {
  throw new Error('Impossible de trouver les catégories dans prisma/seed.ts.');
}

const categories = vm.runInNewContext(`(${categoriesMatch[1]})`, Object.create(null));
if (!Array.isArray(categories) || categories.length === 0) {
  throw new Error('Le questionnaire de référence ne contient aucune catégorie.');
}

const questionCount = categories.reduce(
  (total, category) => total + category.questions.length,
  0
);
const optionCount = categories.reduce(
  (total, category) =>
    total +
    category.questions.reduce(
      (questionTotal, question) => questionTotal + question.options.length,
      0
    ),
  0
);

if (questionCount !== 38) {
  throw new Error(`38 questions attendues, ${questionCount} trouvées.`);
}

const diagnosticJson = JSON.stringify(categories, null, 2);
if (diagnosticJson.includes('$diagnostic_json$')) {
  throw new Error('Le questionnaire contient un délimiteur SQL réservé.');
}

const migrationSql = `-- Create the default Violentomètre diagnostic when it is missing.
-- This migration is idempotent and never replaces an existing diagnostic.
DO $migration$
DECLARE
    diagnostic_id TEXT := 'default-violentometre-v1';
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
${diagnosticJson}
$diagnostic_json$::JSONB;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Diagnostic"
        WHERE "id" = diagnostic_id
           OR "title" ILIKE 'Violentomètre%'
           OR "title" ILIKE 'Violentometre%'
    ) THEN
        RAISE NOTICE 'Le diagnostic Violentomètre existe déjà, aucune insertion effectuée.';
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
        'Violentomètre - Évaluez votre relation',
        'Un outil d''autodiagnostic pour identifier les signes de violence dans une relation. Ce questionnaire est confidentiel et anonyme.',
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

    RAISE NOTICE 'Diagnostic Violentomètre créé avec % catégories, % questions et % options.',
        category_index,
        ${questionCount},
        ${optionCount};
END;
$migration$;
`;

fs.mkdirSync(migrationDirectory, { recursive: true });
fs.writeFileSync(migrationPath, migrationSql, 'utf8');

console.log(
  `Migration générée: ${path.relative(projectRoot, migrationPath)} ` +
    `(${categories.length} catégories, ${questionCount} questions, ${optionCount} options)`
);
