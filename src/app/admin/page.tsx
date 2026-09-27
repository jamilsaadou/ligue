import { prisma } from '@/lib/prisma';

const formatShortDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

const buildLastNDays = (days: number) => {
  const now = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now.getTime() - (days - 1 - index) * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    return { date, key, label: formatShortDate(date) };
  });
};

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const accessDenied = params.access === 'denied';
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalSubmissions,
    avgScore,
    levelGroups,
    eventsLastWeek,
    topPages
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.diagnosticSubmission.count(),
    prisma.diagnosticSubmission.aggregate({
      _avg: { totalScore: true }
    }),
    prisma.diagnosticSubmission.groupBy({
      by: ['level'],
      _count: { level: true }
    }),
    prisma.trackingEvent.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true }
    }),
    prisma.trackingEvent.groupBy({
      by: ['path'],
      _count: { path: true },
      where: { createdAt: { gte: weekAgo } },
      orderBy: { _count: { path: 'desc' } },
      take: 5
    })
  ]);

  const levels = levelGroups.reduce<Record<string, number>>((acc, row) => {
    acc[row.level] = row._count.level;
    return acc;
  }, {});

  const daily = buildLastNDays(7).map((day) => ({
    ...day,
    value: eventsLastWeek.filter(
      (event) => event.createdAt.toISOString().slice(0, 10) === day.key
    ).length
  }));

  const maxDaily = Math.max(1, ...daily.map((d) => d.value));
  const averageScoreValue = avgScore._avg.totalScore ?? 0;

  return (
    <div className="space-y-12">
      {accessDenied && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          Ce module n’est pas autorisé pour votre compte administrateur.
        </div>
      )}
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Vue globale
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Tableau de bord
        </h1>
        <p className="text-slate-600 mt-2">
          Suivi des diagnostics, de l’activité et des comptes utilisateurs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
        {[
          { label: 'Utilisateurs', value: totalUsers, hint: `+${newUsers} sur 24h` },
          { label: 'Diagnostics soumis', value: totalSubmissions, hint: 'Total' },
          {
            label: 'Score moyen',
            value: averageScoreValue.toFixed(1),
            hint: 'Toutes réponses'
          },
          {
            label: 'Alertes danger',
            value: levels.danger || 0,
            hint: 'Dernières réponses'
          }
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-6">
            <div className="text-sm text-slate-500">{stat.label}</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">
              {stat.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{stat.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="glass-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Trafic des 7 derniers jours
            </h2>
            <span className="text-xs text-slate-400">Pages visitées</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {daily.map((entry) => (
              <div key={entry.key} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-[#f15b24] to-[#f2a07b]"
                  style={{ height: `${(entry.value / maxDaily) * 100}%` }}
                  title={`${entry.value} visites`}
                />
                <span className="text-xs text-slate-400">{entry.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Répartition des niveaux
          </h2>
          <div className="space-y-4">
            {[
              { key: 'safe', label: 'Sécurisé', color: '#64748b' },
              { key: 'warning', label: 'Alerte', color: '#f15b24' },
              { key: 'danger', label: 'Danger', color: '#ef4444' }
            ].map((item) => {
              const value = levels[item.key] || 0;
              const total = Math.max(1, totalSubmissions);
              const percent = (value / total) * 100;
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{item.label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 mt-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Pages les plus visitées (7 jours)
          </h2>
          <div className="space-y-3">
            {topPages.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucun trafic enregistré pour le moment.
              </p>
            )}
            {topPages.map((page) => (
              <div
                key={page.path}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm text-slate-700">{page.path}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {page._count.path}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Prochaines actions
          </h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Mettre à jour le diagnostic actif et vérifier les seuils.</li>
            <li>Ajouter des ressources par pays pour élargir l’accompagnement.</li>
            <li>Exporter les logs de parcours pour les besoins internes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
