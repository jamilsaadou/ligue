# Diagnostic de sécurité — Violentomètre

Date : 16 septembre 2026. Périmètre : code local Next.js, routes API, authentification, autorisations, données sensibles, configuration locale et dépendances verrouillées.

## Conclusion

**Risque élevé ; configuration locale critique si elle est reprise en production.** Corriger en priorité les secrets, la protection des connexions, le contrôle des tentatives et les dépendances. Les constats ne démontrent pas une compromission passée.

Audit du code et quatre vérifications isolées avec base de données simulée. Aucun test offensif sur un serveur distant, aucune modification des comptes ou des données réelles. Le serveur de production, HTTPS, le proxy, les sauvegardes et les droits PostgreSQL n'ont pas été contrôlés. Une protection externe peut atténuer certains constats, mais elle n'est pas visible dans ce dépôt.

## 1. Critique conditionnel — secrets locaux inadaptés à la production

- `.env` et `.env.local` : `SESSION_SECRET` présente un marqueur de démonstration ; `SUPER_ADMIN_PASSWORD` ne comporte que quatre caractères ; `SESSION_COOKIE_SECURE=false`.
- `src/lib/auth.ts:20` accepte le secret sans exigence de qualité. `src/lib/cookie-flags.ts:4` permet de retirer Secure même en production.
- Un secret connu permet de signer un jeton pour un identifiant utilisateur connu. Le rôle est toutefois relu en base : il faut viser un compte existant, on ne peut pas simplement inventer un rôle dans le jeton.
- Les fichiers locaux ont des permissions 0644. Ils sont ignorés par Git et aucune occurrence de ces deux chemins n'a été trouvée dans l'historique local accessible. Leurs valeurs ne sont pas reproduites ici.

**Correction :** générer un secret aléatoire d'au moins 32 octets, renouveler le mot de passe administrateur, imposer Secure en production, limiter les permissions des fichiers et utiliser le gestionnaire de secrets de l'hébergeur. Vérifier les valeurs réellement déployées. La clé de chiffrement SMTP dérive aussi de SESSION_SECRET (`src/lib/secrets.ts`) : prévoir le rechiffrement ou la ressaisie du secret SMTP pendant la rotation.

## 2. Élevé — réactivation du super-administrateur par les identifiants d'environnement

`src/lib/auth.ts:133–151` : la connexion via SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD fait un upsert qui rétablit `role: super_admin`, `isActive: true` et le mot de passe d'environnement, avant le contrôle habituel d'activité.

**Impact :** désactiver ce compte, le rétrograder ou changer son mot de passe dans l'application ne retire pas cet accès tant que l'ancien secret d'environnement reste configuré.

**Correction :** réserver ces variables à un amorçage ponctuel ; ensuite authentifier exclusivement sur le compte en base. Rotation immédiate de ce secret s'il a servi en production.

## 3. Élevé — protection insuffisante contre les essais de connexion et les abus

`src/app/api/auth/login/route.ts` et `register/route.ts` : aucun quota, délai progressif ou verrouillage applicatif. L'inscription vérifie seulement que le mot de passe n'est pas vide (`register/route.ts:29`) ; un mot de passe d'un caractère est accepté dans le test isolé. La réponse 409 révèle aussi l'existence d'un email.

Les routes publiques `/api/track`, `/api/diagnostic/attempt` et `/api/diagnostic/submit` peuvent générer des écritures répétées ; une soumission peut déclencher un email si SMTP est activé. L'absence d'attemptId autorise plusieurs nouvelles soumissions. Aucun débit n'a été envoyé pour mesurer une saturation.

**Correction :** quotas partagés par IP et compte, politique cohérente de mots de passe, validation stricte des types et tailles, limites des corps avant lecture complète, quotas d'envoi et déduplication. Tenir compte de la troncature bcrypt à 72 octets. Vérifier aussi les protections du proxy.

## 4. Élevé — absence de contrôle du propriétaire d'une tentative

- `src/app/api/diagnostic/attempt/route.ts:117` : PATCH filtre sur l'identifiant, le diagnostic et l'état, sans userId ou preuve de possession de session.
- `src/app/api/diagnostic/submit/route.ts:70` : l'upsert utilise seulement attemptId ; il peut terminer une tentative existante et remplacer son rattachement utilisateur/session. Il ne vérifie pas non plus la cohérence entre le diagnostic de la tentative et celui transmis.
- Le test isolé montre qu'une requête sans cookie atteint l'écriture PATCH avec 999 réponses.

**Précondition :** connaître un identifiant de tentative ; les UUID générés normalement ne sont pas aisément devinables. Aucune récupération massive d'identifiants n'a été démontrée. Ce constat porte sur l'intégrité, pas sur une lecture publique prouvée des réponses.

**Correction :** lier la tentative à l'utilisateur authentifié ou à un jeton anonyme imprévisible délivré par le serveur, contrôler ce lien à chaque écriture et imposer la correspondance diagnostic/tentative dans la transaction. Un sessionId librement choisi par le client ne suffit pas.

## 5. Élevé — anonymat annoncé incompatible avec la collecte

`src/app/confidentialite/page.tsx:32` présente un traitement local des réponses. Le diagnostic affiche aussi « Totalement anonyme ». Pourtant :

- `src/app/api/diagnostic/submit/route.ts:107` conserve réponses détaillées, scores, userId éventuel et sessionId.
- `src/app/api/track/route.ts:65` enregistre les événements avec IP, informations techniques et identifiants permettant des rapprochements.
- `src/lib/analytics-client.ts:23` conserve un identifiant de suivi persistant dans localStorage ; le suivi s'exécute automatiquement dans TrackingProvider.
- La purge repérée concerne uniquement TrackingEvent, de manière probabiliste ; aucune purge des soumissions et tentatives n'a été trouvée.

**Impact :** des réponses très sensibles peuvent être rattachées à un compte ou corrélées avec une adresse IP. Il s'agit au mieux de données pseudonymisées pour les visiteurs sans compte. Ce rapport ne formule pas de conclusion juridique.

**Correction :** décider explicitement du besoin de conserver les réponses ; minimiser les champs, dissocier suivi et diagnostics, fixer et automatiser la rétention, adapter l'information utilisateur et les choix de collecte au fonctionnement réel.

## 6. Moyen — résultats falsifiables côté client

`src/app/api/diagnostic/submit/route.ts:53–58` accepte totalScore, maxScore, level, answers et categoryScores du client sans recalcul. Le test accepte `totalScore=999`, `maxScore=1`, `level=safe` et des réponses vides. Le diagnostic est cherché par identifiant sans exiger son état actif.

**Impact :** statistiques, historique et notifications inexacts. Cela ne démontre pas une modification du résultat affiché chez un autre visiteur.

**Correction :** charger les questions et options autorisées, valider les réponses et calculer les scores/niveaux au serveur ; refuser les diagnostics inactifs et les soumissions incomplètes selon les règles métier.

## 7. Moyen — sessions non révocables individuellement

`src/lib/auth.ts:10` fixe une validité de sept jours. `src/app/api/auth/logout/route.ts:6` supprime seulement le cookie local ; la modification du mot de passe dans `profile/route.ts` n'invalide pas les jetons déjà émis. Un jeton copié reste vérifiable après la déconnexion dans le test isolé.

`getSession()` relit correctement le rôle et l'activité en base. En revanche, `src/lib/analytics-server.ts:20` vérifie seulement la signature : les routes de suivi et diagnostic continuent d'accepter les jetons de comptes désactivés jusqu'à expiration.

**Correction :** sessions stockées côté serveur ou version de session utilisateur, révocation lors d'un changement de mot de passe/déconnexion, contrôle uniforme de l'activité sur toutes les routes.

## 8. Moyen — traces sensibles persistantes sur appareil partagé

`src/app/diagnostic/page.tsx:98–137` sauvegarde réponses et copie du questionnaire en localStorage. L'expiration de sept jours est vérifiée à la réouverture de la page (`:326`), pas par une suppression automatique du navigateur. Les résultats terminés sont également sauvegardés.

**Impact :** une personne accédant au même profil navigateur peut retrouver les réponses. La déconnexion ne les efface pas.

**Correction :** proposer la conservation explicitement, préférer un stockage limité à la session, ajouter un effacement facilement accessible et traiter les traces lors de la déconnexion. Un chiffrement dont la clé est dans le même navigateur ne résout pas à lui seul ce risque.

## 9. Dépendances — 21 paquets signalés par npm audit

Résultat du registre consulté : **1 critique, 15 élevés, 3 modérés, 2 faibles**, paquets de développement et de production compris. Ces nombres ne sont pas un décompte de failles exploitables indépendantes : plusieurs paquets partagent les mêmes avis transitifs. Résultat intégral : `docs/security-npm-audit.json`.

- Next.js verrouillé en 16.1.6 : npm propose 16.3.5. Les avis critiques concernent notamment les [serveurs Windows](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36) et le [traitement AVIF par l'API d'images](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4). L'hôte local est macOS ; le système de production et les conditions AVIF ne sont pas vérifiés. L'application utilise next/image, mais aucune exploitation n'a été essayée.
- Des [avis de déni de service Server Components](https://github.com/vercel/next.js/security/advisories/GHSA-q4gf-8mx6-v5v3) concernent également la version installée ; vérifier les fonctionnalités exposées lors de la mise à jour.
- Nodemailer 9.0.3 et plusieurs dépendances transitives sont signalés. Les adresses SMTP sont ici configurées par un administrateur et limitées en longueur : ne pas assimiler automatiquement l'avis npm à un point d'entrée public exploitable.

**Correction :** mettre à jour Next.js et eslint-config-next de manière cohérente, renouveler les dépendances compatibles, puis vérifier build, authentification, administration, images et SMTP. Relancer l'audit ; éviter un `npm audit fix --force` non contrôlé.

## Durcissements complémentaires

- `csrf-core.ts` n'est utilisé par aucune route ; aucune vérification Origin ni Content-Type explicite n'a été trouvée. SameSite=Lax protège une partie des scénarios, mais ne constitue pas une protection complète, notamment pour le login CSRF ou un sous-domaine hostile. Les routes utilisant request.json() acceptent aussi un JSON envoyé en text/plain. Ajouter contrôle d'origine et protections CSRF adaptées ; aucun exploit navigateur complet n'a été exécuté.
- `next.config.ts` ne configure pas CSP, protection contre l'intégration en iframe, HSTS ni Referrer-Policy. Vérifier les en-têtes réellement ajoutés par l'hébergement avant de conclure à leur absence en production.
- Le module SMTP permet de désactiver la vérification des certificats et d'utiliser un hôte arbitraire. Restreindre ces possibilités et imposer TLS selon la configuration de production.
- `/api/track` accepte librement le nom et la catégorie des événements dans la même table que les traces administratives. Séparer les journaux d'audit fiables des événements clients falsifiables.

## Protections déjà présentes

- Vérification des rôles et modules sur les API administrateur ; création d'administrateurs réservée au super-administrateur.
- Cookies HttpOnly et SameSite=Lax ; signatures HMAC rejetant une altération dans le test.
- Relecture du rôle et du statut du compte pour les accès protégés via getSession.
- Mots de passe nouvellement enregistrés hachés avec bcrypt ; secret SMTP chiffré en AES-GCM.
- Configuration publique exposée par liste autorisée ; usage de Prisma et requêtes SQL paramétrées observées.

Ces protections réduisent les risques mais n'annulent pas les défauts ci-dessus.

## Ordre de traitement

1. Vérifier les secrets déployés, les renouveler si concernés, sécuriser les cookies et supprimer la réactivation par identifiants d'environnement.
2. Mettre à jour les dépendances et protéger les API publiques contre les abus.
3. Contrôler le propriétaire des tentatives et recalculer les résultats côté serveur.
4. Ajouter la révocation des sessions et harmoniser les contrôles d'activité.
5. Réduire les données sensibles conservées, corriger l'information utilisateur, traiter les traces locales et terminer le durcissement HTTP.

## Vérifications effectuées

Script temporaire `/tmp/violentometre-security-check.cjs`, exécuté avec `node --import tsx` : quatre scénarios confirmés, toutes les opérations de base utilisées remplacées par des doublures en mémoire. Audit npm consulté en ligne, sans installation ni mise à jour. Aucun fichier applicatif modifié ; seuls ce rapport et le résultat npm ont été ajoutés au projet.
