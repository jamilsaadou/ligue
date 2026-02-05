import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { BarChart3, Users, ClipboardCheck, AlertTriangle } from 'lucide-react';

export default async function AdminStatsPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/connexion');
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Statistiques
          </h1>
          <p className="text-slate-600">
            Vue d'ensemble des résultats et de l'activité des diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Diagnostics complétés', value: '—', icon: ClipboardCheck },
            { label: 'Utilisateurs actifs', value: '—', icon: Users },
            { label: 'Alertes danger', value: '—', icon: AlertTriangle },
            { label: 'Score moyen', value: '—', icon: BarChart3 }
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <stat.icon className="w-6 h-6 text-[#eb5f2a] mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 md:p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Tableau de bord en préparation
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Nous connecterons ces statistiques à la base de données des diagnostics.
            Si vous souhaitez des indicateurs spécifiques, dites-nous lesquels.
          </p>
        </div>
      </div>
    </div>
  );
}
