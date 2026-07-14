export const ADMIN_MODULES = [
  {
    key: 'statistics',
    label: 'Statistiques',
    description: 'Indicateurs, résultats et tendances des diagnostics.'
  },
  {
    key: 'diagnostics',
    label: 'Diagnostics',
    description: 'Création, modification et publication des questionnaires.'
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    description: 'Consultation et gestion des comptes standards.'
  },
  {
    key: 'logs',
    label: 'Logs et tracking',
    description: 'Parcours, événements et informations techniques.'
  },
  {
    key: 'resources',
    label: 'Ressources',
    description: 'Structures d’aide, pays et contacts d’urgence.'
  },
  {
    key: 'settings',
    label: 'Configuration',
    description: 'Identité du site, notifications et paramètres SMTP.'
  }
] as const;

export type AdminModuleKey = (typeof ADMIN_MODULES)[number]['key'];

export const ADMIN_MODULE_KEYS = ADMIN_MODULES.map((module) => module.key);

export const isAdminModule = (value: unknown): value is AdminModuleKey =>
  typeof value === 'string' && ADMIN_MODULE_KEYS.includes(value as AdminModuleKey);

export const hasAdminModule = (
  role: string,
  modules: readonly string[],
  module: AdminModuleKey
) => role === 'super_admin' || (role === 'admin' && modules.includes(module));
