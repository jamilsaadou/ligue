import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSession } from '@/lib/auth';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
    redirect(session?.role === 'user' ? '/compte' : '/login');
  }

  return (
    <div className="admin-layout">
      {/* Hide main site header, footer, decorations and reset styles */}
      <style>{`
        body > header,
        body > footer,
        body > .bg-decoration,
        #emergency-button {
          display: none !important;
        }
        body > main {
          padding-top: 0 !important;
          min-height: auto !important;
        }
        body > main > .admin-layout {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
        }
      `}</style>

      <div className="fixed inset-0 flex h-dvh flex-col lg:flex-row bg-slate-100">
        {/* Sidebar fixe à gauche */}
        <aside className="w-full lg:w-64 max-h-[60dvh] lg:max-h-none flex-shrink-0 bg-slate-900 text-white shadow-xl overflow-y-auto">
          <AdminSidebar role={session.role} adminModules={session.adminModules} />
        </aside>

        {/* Contenu principal */}
        <div role="region" aria-label="Contenu de l’administration" className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="admin-content w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
