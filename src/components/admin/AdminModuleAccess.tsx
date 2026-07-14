import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { hasAdminModule, type AdminModuleKey } from '@/lib/admin-modules';

export default async function AdminModuleAccess({
  module,
  children
}: {
  module: AdminModuleKey;
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect('/login');
  if (session.role === 'user') redirect('/compte');
  if (!hasAdminModule(session.role, session.adminModules, module)) {
    redirect('/admin?access=denied');
  }

  return children;
}
