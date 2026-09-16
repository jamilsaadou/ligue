export default function StatisticsLoading() {
  return (
    <div
      role="status"
      aria-label="Chargement des statistiques"
      className="space-y-6"
    >
      <span className="sr-only">Chargement des statistiques…</span>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-56 rounded-2xl border border-slate-200 bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((value) => (
            <div
              key={value}
              className="h-44 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
          <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
