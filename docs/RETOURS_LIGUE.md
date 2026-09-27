# Retours Ligue — 27 septembre 2026

## Intégration

- Navigation active en gras avec `aria-current`, sur ordinateur et mobile.
- Suppression de l’illustration flottante des diagnostics sur l’accueil.
- Logo fourni dans `public/brand/logo-ligue.png`, orange #f15b24.
- Manrope conservée et hébergée localement avec sa licence OFL, en attendant les références typographiques officielles.
- Cinq outils complets en lecture libre dans `/ressources`, indépendants de la base de données. Les quatre outils autres que le baromètre économique reprennent les questionnaires existants ; ce ne sont pas des affiches officielles fournies par la Ligue.
- Les 24 situations économiques ont été vérifiées visuellement dans le PDF fourni, dans l’ordre et avec les trois zones (1–5, 6–15, 16–24). Attribution : Les Glorieuses et Oseille & Compagnie. Le contact français du document a été remplacé par les contacts nigériens sur la page web.
- Une migration corrige les anciens titres « Haromètre » sans modifier les identifiants ni les réponses et remplace uniquement l’ancienne description par défaut à portée régionale.
- Annuaire public et pays proposés à l’inscription limités au Niger ; aucune suppression de données historiques en base.
- Suppression de « Fait avec ♥ au Niger » et du bouton d’appel au 17 dans le pied de page.

## Contacts à recevoir

Le PDF de maquettes contient des coordonnées fictives (+227 83 XX XX XX, contact@gmail.com et une adresse américaine). Elles n’ont pas été utilisées.

À confirmer par la Ligue : adresse mail, téléphone, WhatsApp de la clinique, numéros des psychologues et gestionnaires de cas, liens sociaux / QR code, polices officielles et autres éventuels baromètres à fournir.

Les paramètres administrateur permettent de renseigner les contacts de la clinique et Facebook, Instagram, X, YouTube. En l’absence de WhatsApp confirmé, les boutons « Clinique juridique » conduisent à sa section ressources ; aucun faux lien WhatsApp n’est publié. Les réseaux sociaux sans URL sont masqués. L’adresse mail déjà configurée n’a pas été considérée comme vérifiée.

## Sources des secours

Vérifiées le 27 septembre 2026 :
- https://www.gov.uk/foreign-travel-advice/niger/getting-help : SAMU 15, police 17, pompiers 18.
- https://travel.state.gov/en/international-travel/travel-advisories/niger.html : police 8383 également.

Ces numéros constituent les services vérifiés, pas un annuaire exhaustif de tous les services spécialisés du Niger.

## Mise en service

Exécuter `npm run diagnostics:deploy` sur la base cible lors du déploiement pour appliquer la nouvelle migration. Aucun déploiement de site ni modification de base n’a été effectué dans cette intervention.

## Vérification

Compilation de production, ESLint et TypeScript réussis. Vérifications navigateur à 1440 et 390 px : navigation active, absence de débordement horizontal, 24 situations économiques, quatre contacts de secours et fermeture du dialogue avec Échap. Contacts WhatsApp, psychologue, gestionnaire de cas, téléphone du pied de page et réseau social vérifiés avec des données simulées, sans écriture en base.
