import { getSession, verifySessionToken } from './auth';
import { hasAdminModule, type AdminModuleKey } from './admin-modules';

export type SessionUser = ReturnType<typeof verifySessionToken>;

export const requireSession = async () => {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
};

export const requireAdmin = async () => {
  const session = await requireSession();
  if (session.role !== 'admin' && session.role !== 'super_admin') {
    throw new Error('FORBIDDEN');
  }
  return session;
};

export const requireSuperAdmin = async () => {
  const session = await requireSession();
  if (session.role !== 'super_admin') {
    throw new Error('FORBIDDEN');
  }
  return session;
};

export const requireAdminModule = async (module: AdminModuleKey) => {
  const session = await requireAdmin();
  if (!hasAdminModule(session.role, session.adminModules, module)) {
    throw new Error('FORBIDDEN');
  }
  return session;
};
