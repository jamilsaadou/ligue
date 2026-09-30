import { prisma } from './prisma';

// Closed by default, including when the setting has not been created yet.
export async function isPublicAuthEnabled(): Promise<boolean> {
  const setting = await prisma.setting.findUnique({ where: { key: 'publicAuthEnabled' } });
  return setting?.value === true;
}

export function isAdminRole(role: string): boolean {
  return role === 'admin' || role === 'super_admin';
}

export async function canAuthenticate(role: string): Promise<boolean> {
  return isAdminRole(role) || await isPublicAuthEnabled();
}
