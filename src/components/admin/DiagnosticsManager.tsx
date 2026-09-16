"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  CheckCircle2,
  ClipboardList,
  FilePenLine,
  Layers3,
  ListChecks,
  Plus,
  Search,
  Send,
} from "lucide-react";
import DiagnosticRowActions from "./DiagnosticRowActions";

export const diagnosticStatuses = {
  active: {
    label: "Actif",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  draft: {
    label: "Brouillon",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  archived: {
    label: "Archivé",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

type DiagnosticSummary = {
  id: string;
  title: string;
  description: string | null;
  status: keyof typeof diagnosticStatuses;
  version: number;
  updatedAt: string;
  categories: number;
  questions: number;
  submissions: number;
  attempts: number;
};

export default function DiagnosticsManager({
  diagnostics,
  canViewStatistics,
}: {
  diagnostics: DiagnosticSummary[];
  canViewStatistics: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const normalized = search.trim().toLocaleLowerCase("fr");
  const visible = diagnostics.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      `${item.title} ${item.description ?? ""}`
        .toLocaleLowerCase("fr")
        .includes(normalized),
  );
  const summaries = [
    { label: "Questionnaires", value: diagnostics.length, icon: ClipboardList },
    {
      label: "Actifs",
      value: diagnostics.filter((d) => d.status === "active").length,
      icon: CheckCircle2,
    },
    {
      label: "Brouillons",
      value: diagnostics.filter((d) => d.status === "draft").length,
      icon: FilePenLine,
    },
    {
      label: "Archivés",
      value: diagnostics.filter((d) => d.status === "archived").length,
      icon: Archive,
    },
  ];
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Diagnostics
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Questionnaires
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Consultez le contenu, suivez les résultats et gérez vos
            questionnaires.
          </p>
        </div>
        <Link
          href="/admin/diagnostics/nouveau"
          className="glass-button inline-flex shrink-0 items-center justify-center gap-2"
        >
          <Plus size={18} aria-hidden="true" />
          Nouveau diagnostic
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaries.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-4 sm:p-5">
            <Icon
              size={20}
              className="mb-3 text-[#eb5f2a]"
              aria-hidden="true"
            />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <section className="space-y-4" aria-label="Liste des diagnostics">
        <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="diagnostic-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Rechercher un questionnaire
            </label>
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="diagnostic-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre ou description…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="diagnostic-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Statut
            </label>
            <select
              id="diagnostic-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm sm:w-44"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(diagnosticStatuses).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p role="status" className="text-sm text-slate-500">
          {visible.length} questionnaire{visible.length > 1 ? "s" : ""} affiché
          {visible.length > 1 ? "s" : ""} sur {diagnostics.length}
        </p>
        {visible.map((item) => (
          <article key={item.id} className="glass-card overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${diagnosticStatuses[item.status].className}`}
                >
                  {diagnosticStatuses[item.status].label}
                </span>
                <span className="text-xs text-slate-500">
                  Version {item.version}
                </span>
              </div>
              <h2 className="mt-3 break-words text-lg font-semibold text-slate-900">
                <Link
                  href={`/admin/diagnostics/${item.id}/details`}
                  className="hover:text-[#eb5f2a]"
                >
                  {item.title}
                </Link>
              </h2>
              <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500">
                {item.description || "Aucune description renseignée."}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Layers3 size={16} aria-hidden="true" />
                  {item.categories} catégorie{item.categories > 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ListChecks size={16} aria-hidden="true" />
                  {item.questions} question{item.questions > 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Send size={16} aria-hidden="true" />
                  {item.submissions} résultat{item.submissions > 1 ? "s" : ""}{" "}
                  enregistré{item.submissions > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 p-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
              <p className="shrink-0 text-xs text-slate-500">
                Mis à jour le{" "}
                <time dateTime={item.updatedAt}>
                  {new Date(item.updatedAt).toLocaleDateString("fr-FR", {
                    timeZone: "UTC",
                  })}
                </time>
              </p>
              <DiagnosticRowActions
                diagnosticId={item.id}
                diagnosticTitle={item.title}
                canViewStatistics={canViewStatistics}
                submissions={item.submissions}
                attempts={item.attempts}
              />
            </footer>
          </article>
        ))}
        {!visible.length && (
          <div className="glass-card p-8 text-center">
            <ClipboardList
              className="mx-auto mb-3 text-slate-400"
              size={32}
              aria-hidden="true"
            />
            <h2 className="font-semibold text-slate-900">
              {diagnostics.length
                ? "Aucun questionnaire ne correspond"
                : "Votre premier questionnaire"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {diagnostics.length
                ? "Modifiez votre recherche ou le statut sélectionné."
                : "Créez un diagnostic pour ajouter vos catégories et vos questions."}
            </p>
            {diagnostics.length > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
                className="mt-4 text-sm font-semibold text-[#eb5f2a]"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
