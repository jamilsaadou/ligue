# Déploiement

Depuis le dossier du projet sur le serveur, avec les variables de production déjà configurées (notamment `DATABASE_URL` et `SESSION_SECRET`) :

```bash
git pull --ff-only origin main && npm ci && npx prisma generate && npm run diagnostics:deploy && npm run build -- --webpack
```

Redémarrer ensuite le service Node avec le gestionnaire utilisé sur le serveur. Le dépôt ne définit pas de nom de service PM2, Docker ou systemd.

## Diagnostics seuls

Une fois le code et les dépendances à jour :

```bash
npm run diagnostics:deploy
```

Cette commande exécute `prisma migrate deploy` : elle applique **toutes** les migrations en attente, y compris les champs de profil utilisateur et les migrations d’ajout de diagnostics.

Diagnostics fournis :

- Violentomètre
- Harcélomètre
- Incestomètre
- Haromètre économique
- Cyber-Violentoscope

Les migrations d’ajout créent les questionnaires absents avec le statut actif. Elles conservent les questionnaires déjà présents (y compris leur statut) et ne modifient pas leurs questions ni les résultats existants. Relancer la commande n’exécute pas de nouveau une migration déjà appliquée ; cela ne rétablit donc pas un questionnaire supprimé après migration.

Ne pas utiliser `prisma migrate reset` pour cette opération. Le seed général n’est pas la commande de déploiement des cinq diagnostics.
