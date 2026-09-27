-- Correct the name while preserving diagnostic IDs, questions and past answers.
UPDATE "Diagnostic"
SET "title" = 'Baromètre des violences économiques', "updatedAt" = CURRENT_TIMESTAMP
WHERE "title" ~* '^Harom[eè]tre';

-- Migrate only the former default description; keep customized editorial content.
UPDATE "Setting"
SET "value" = to_jsonb('Plateforme numérique d’autodiagnostic des violences au Niger.'::text)
WHERE "key" = 'siteDescription'
  AND "value" #>> '{}' = 'Première plateforme numérique d''autodiagnostic des violences en Afrique de l''Ouest.';
