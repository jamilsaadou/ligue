"use client";

import Link from "next/link";
import { RefreshCw, BarChart3 } from "lucide-react";

export default function StatisticsError({ reset }: { reset: () => void }) {
  return (
    <section
      className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-10"
      role="alert"
    >
      <BarChart3
        className="mx-auto h-10 w-10 text-slate-400"
        aria-hidden="true"
      />
      <h1 className="mt-5 text-2xl font-bold text-slate-900">
        Statistiques indisponibles
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Les données n’ont pas pu être chargées. Réessayez dans un instant pour
        consulter les indicateurs.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
        >
          Tableau de bord
        </Link>
      </div>
    </section>
  );
}
