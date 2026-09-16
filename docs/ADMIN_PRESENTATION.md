# Présentation des diagnostics, journaux, utilisateurs et ressources

## Organisation

- Diagnostics : indicateurs, recherche, filtre de statut, fiches et actions Détails / Statistiques / Modifier / Supprimer. Les statistiques ciblent le questionnaire. La consultation est distincte de l’éditeur.
- Journaux : indicateurs calculés sur les filtres, recherche, type d’événement, pagination et détails techniques dépliables. Les dates sont affichées en UTC.
- Utilisateurs : compteurs globaux, filtres, fiches avec détails, modification et désactivation/réactivation. Les autorisations existantes et la protection du compte courant sont conservées.
- Ressources : compteurs globaux, recherche, filtres de pays et de type ; consultation, création, modification et suppression avec confirmation. La liste est actualisée après enregistrement.
- Les fenêtres de gestion utilisent un dialogue natif pour le focus clavier et la fermeture avec Échap.

## Annuaire public

La page `/ressources` présente les contacts administrés via `/api/resources`, avec filtres de pays et de service, recherche et états de chargement, d’erreur et de liste vide. Aucun contact de secours codé en dur n’est injecté lorsque la base est vide ou indisponible. Le bouton d’urgence n’apparaît que pour un numéro exploitable du pays sélectionné. Les liens externes sont limités à HTTP(S), les actions de contact à des adresses e-mail ou numéros reconnus.

## API

`PUT /api/admin/resources/[id]` modifie les coordonnées d’une ressource existante. `DELETE` supprime uniquement la ressource ; le pays est conservé. Les deux actions exigent le module `resources`. La modification valide les champs obligatoires, le type, le pays et le protocole du site web.

Les pages serveur vérifient leur module avant de lire les données. Aucun changement de schéma requis par cette refonte.

## Vérifications effectuées

- TypeScript et ESLint sur les fichiers concernés.
- Navigation dans Chrome aux largeurs 320, 375, 768, 1024 et 1440 px, sans débordement horizontal involontaire.
- Diagnostics : filtres, liens, détail, annulation et suppression d’une fixture, avec erreur simulée et nouvel essai.
- Journaux : détails, recherche, réinitialisation et pagination.
- Utilisateurs : détails, modification d’un compte de test, annulation de désactivation, fermeture clavier et fenêtre sur mobile.
- Ressources : détails, création, modification et suppression sur une base PostgreSQL isolée ; aucune donnée réelle modifiée.
- Annuaire public : filtres, lien e-mail, absence de bouton d’urgence pour un pays sans numéro, erreur réseau et nouvel essai.
