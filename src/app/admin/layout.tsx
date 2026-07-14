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

      <div className="fixed inset-0 flex bg-slate-100">
        {/* Sidebar fixe à gauche */}
        <aside className="w-64 flex-shrink-0 bg-slate-900 text-white shadow-xl overflow-y-auto">
          <AdminSidebar role={session.role} adminModules={session.adminModules} />
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
