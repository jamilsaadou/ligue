import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DiagnosticRowActions from '@/components/admin/DiagnosticRowActions';

export default async function AdminDiagnosticsPage() {
  const diagnostics = await prisma.diagnostic.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { categories: true }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Diagnostics
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Questionnaires</h1>
          <p className="text-slate-600 mt-2">
            Créez et pilotez plusieurs versions du violentomètre.
          </p>
        </div>
        <Link
          href="/admin/diagnostics/nouveau"
          className="glass-button inline-flex items-center justify-center"
        >
          Nouveau diagnostic
        </Link>
      </div>

      <div className="glass-card p-7 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr>
              <th className="py-3 pr-4">Titre</th>
              <th className="py-3 pr-4">Statut</th>
              <th className="py-3 pr-4">Catégories</th>
              <th className="py-3 pr-4">Version</th>
              <th className="py-3 pr-4">Mise à jour</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((diagnostic) => (
              <tr key={diagnostic.id} className="border-b last:border-b-0">
                <td className="py-3 pr-4 text-slate-900">
                  <Link
                    href={`/admin/diagnostics/${diagnostic.id}`}
                    className="font-medium hover:text-[#eb5f2a]"
                  >
                    {diagnostic.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-slate-600 capitalize">
                  {diagnostic.status}
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {diagnostic.categories.length}
                </td>
                <td className="py-3 pr-4 text-slate-600">{diagnostic.version}</td>
                <td className="py-3 pr-4 text-slate-600">
                  {diagnostic.updatedAt.toLocaleDateString('fr-FR')}
                </td>
                <td className="py-3">
                  <DiagnosticRowActions
                    diagnosticId={diagnostic.id}
                    diagnosticTitle={diagnostic.title}
                  />
                </td>
              </tr>
            ))}
            {diagnostics.length === 0 && (
              <tr>
                <td className="py-6 text-slate-500" colSpan={6}>
                  Aucun diagnostic enregistré. Créez le premier questionnaire.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
