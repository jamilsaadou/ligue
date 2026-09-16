# Présentation et responsivité — 16 septembre 2026

## Problèmes repérés et corrigés

| Problème | Correction |
| --- | --- |
| À 768 et 1024 px, les liens Connexion, Inscription et Urgence sortaient du bandeau. Le masquage horizontal du body cachait le défaut sans le résoudre. | Menu repliable jusqu'à 1280 px ; navigation complète au-delà. |
| Sur téléphone, le bandeau affichait uniquement le pictogramme. | Nom du site visible, avec troncature pour les noms longs. |
| Le menu mobile pouvait dépasser la hauteur disponible. | Hauteur limitée à la fenêtre, défilement interne, intitulés accessibles et fermeture avec Échap. |
| La colonne administrative de 256 px restait affichée sur téléphone et comprimait le contenu. | Navigation repliable en haut sur mobile/tablette, colonne latérale à partir de 1024 px ; zone de contenu réductible et défilante. |
| Les filtres utilisateurs/logs/statistiques imposaient des largeurs mal adaptées à l'espace restant. | Filtres empilables, retour à la ligne et champs limités à leur conteneur. |
| Les actions en pied de fenêtre utilisateur pouvaient déborder. | Retour à la ligne des boutons. |
| La fenêtre d'urgence n'avait pas de hauteur maximale et son positionnement mêlait transformations CSS et animation. | Dialogue natif centré, limité à la hauteur visible, défilement interne, gestion du focus et fermeture avec Échap. |
| Les numéros et noms de pays étaient trop serrés sur les plus petits écrans. | Espacement explicite, numéro non compressible et pictogramme secondaire masqué sur mobile. |
| Les deux boutons d'accueil avaient des tailles différentes sur mobile/tablette. | Même taille de texte et mêmes marges internes pour les variantes pleine et contour. |
| L'indicateur de défilement de l'accueil se superposait aux mentions de confiance sur mobile. | Indicateur réservé aux grands écrans. |

## Vérifications

- Captures et mesures dans Chrome local : accueil, entrée du diagnostic, ressources, connexion et inscription à **375, 768, 1024 et 1440 px** (20 combinaisons).
- Après correction : aucun débordement global sur ces combinaisons. La liste de pays des ressources reste volontairement défilante horizontalement.
- Dialogue d'urgence contrôlé à **375 × 667**, **667 × 375** et **320 × 568** ; contenu accessible par défilement.
- Administration : tableau de bord, utilisateurs et logs contrôlés à **320 px**, sans débordement de la zone de contenu.
- Vérification finale ciblée du menu avec Échap, du dialogue à 320 px et des liens du bandeau à 1280 px, avec réponses API simulées.
- Contrôles TypeScript (`tsc --noEmit`), ESLint sur les fichiers TSX modifiés et `git diff --check`.

## Limites et point restant

La base PostgreSQL locale est devenue inaccessible sur `localhost:5432` pendant l'ouverture de `/admin/statistiques`, qui a renvoyé une erreur 500. La validation visuelle complète des statistiques, de la configuration et du constructeur de diagnostics, ainsi que les autres tailles de l'administration, reste à effectuer une fois la base disponible. Aucun changement de configuration de base de données n'a été réalisé.

Les parcours complets de résultat/partage du diagnostic et les variantes de contenu très long n'ont pas été couverts de bout en bout. Les vérifications ont été réalisées dans Chrome, sans validation sur un appareil iOS physique.
