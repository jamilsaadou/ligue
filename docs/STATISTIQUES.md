# Page Statistiques — restructuration

## Organisation

- **Vue d’ensemble** : démarrages, résultats reçus, complétion et temps médian ; comparaison avec la période précédente.
- **Parcours** : courbes ou histogrammes, complétion des tentatives, distribution des durées et modes « pour soi / pour un proche ».
- **Résultats** : diagramme en anneau des niveaux, score moyen valide, comparaison triable des diagnostics et dernières soumissions sans identité ni réponses détaillées.
- **Fréquentation** : pages vues, navigateurs identifiés, consultations sans identifiant, carte d’activité hebdomadaire par heure, sources, appareils, pays et pages principales.
- Filtres sur 7, 30 ou 90 jours, sélection du diagnostic, actualisation, export CSV agrégé et définitions des indicateurs.

## Règles de calcul

Les dates utilisent UTC. La période commence à minuit, inclut le jour en cours (partiel) et finit à l’heure du relevé. La comparaison porte sur l’intervalle immédiatement précédent de même durée. Pour 90 jours, toutes les semaines sont affichées, y compris les semaines partielles aux extrémités.

La complétion est la proportion de tentatives démarrées dans la période possédant une soumission rattachée au **même diagnostic**, antérieure au relevé. Les résultats reçus pendant la période sont comptés séparément : ils peuvent provenir de tentatives plus anciennes. Les tentatives non terminées ne sont plus présentées comme des abandons définitifs.

Les moyennes de score excluent les scores impossibles et les maxima nuls. Les durées nulles, absentes ou négatives sont exclues de la moyenne et de la médiane. Une mesure indisponible apparaît sous forme de tiret ; une activité effectivement nulle reste à zéro.

Le trafic concerne toujours le site entier, ce qui est indiqué dans l’interface. Les identifiants de navigateur distincts ne sont pas assimilés à des personnes uniques. L’absence de compte associé n’est pas présentée comme une garantie d’anonymat.

## Validation

- Tests unitaires : `node --import tsx --test src/lib/analytics-metrics.test.ts`.
- Vérification des agrégations SQL sur une base PostgreSQL temporaire, avec données fictives : périodes 7/30/90 jours, tentative ancienne soumise récemment, score invalide, durées absentes, filtre vide, paramètres invalides et indépendance du trafic global.
- Tests Chrome sur prévisualisation isolée : 320, 375, 768, 1024 et 1440 px ; filtres, tri, bascule courbes/barres, accès tabulaire aux données et téléchargement CSV.
- TypeScript et ESLint sur les fichiers concernés.

Aucune donnée de démonstration n’est intégrée au code applicatif. La base réelle n’a pas été utilisée pour les tests d’intégration. Les dépendances du projet et le schéma de données restent identiques.
