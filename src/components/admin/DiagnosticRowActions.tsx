"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useId } from "react";
import { BarChart3, Eye, Pencil, Trash2, Loader2 } from "lucide-react";

export default function DiagnosticRowActions({
  diagnosticId,
  diagnosticTitle,
  canViewStatistics = false,
  submissions = 0,
  attempts = 0,
  hideDetails = false,
}: {
  diagnosticId: string;
  diagnosticTitle: string;
  canViewStatistics?: boolean;
  submissions?: number;
  attempts?: number;
  hideDetails?: boolean;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";
  const neutral = `${base} border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-700`;
  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/diagnostics/${diagnosticId}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error("Impossible de supprimer le diagnostic. Réessayez.");
      dialog.current?.close();
      if (hideDetails) router.push("/admin/diagnostics");
      router.refresh();
    } catch {
      setError("Impossible de supprimer le diagnostic. Réessayez.");
    } finally {
      setIsDeleting(false);
    }
  }
  return (
    <>
      <div
        className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
        role="group"
        aria-label={`Actions pour ${diagnosticTitle}`}
      >
        {!hideDetails && (
          <Link
            href={`/admin/diagnostics/${diagnosticId}/details`}
            className={neutral}
          >
            <Eye size={16} aria-hidden="true" />
            Détails
          </Link>
        )}
        {canViewStatistics && (
          <Link
            href={`/admin/statistiques?diagnostic=${encodeURIComponent(diagnosticId)}`}
            className={neutral}
          >
            <BarChart3 size={16} aria-hidden="true" />
            Statistiques
          </Link>
        )}
        <Link
          href={`/admin/diagnostics/${diagnosticId}`}
          className={`${base} border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100`}
        >
          <Pencil size={16} aria-hidden="true" />
          Modifier
        </Link>
        <button
          type="button"
          onClick={() => {
            setError("");
            dialog.current?.showModal();
          }}
          className={`${base} border-red-200 bg-white text-red-700 hover:bg-red-50`}
        >
          <Trash2 size={16} aria-hidden="true" />
          Supprimer
        </button>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onCancel={(e) => {
          if (isDeleting) e.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-950/50"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 aria-hidden="true" size={22} />
        </div>
        <h2 id={titleId} className="text-xl font-bold text-slate-900">
          Supprimer ce diagnostic ?
        </h2>
        <p className="mt-3 break-words text-sm text-slate-600">
          « {diagnosticTitle} » sera définitivement supprimé, avec ses
          catégories, ses questions, ses {attempts} tentatives et ses{" "}
          {submissions} résultats enregistrés.
        </p>
        <p className="mt-2 text-sm font-medium text-red-700">
          Cette action est irréversible.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            autoFocus
            type="button"
            onClick={() => dialog.current?.close()}
            disabled={isDeleting}
            className={`${neutral} disabled:opacity-50`}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`${base} border-red-600 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
            {isDeleting ? "Suppression…" : "Supprimer définitivement"}
          </button>
        </div>
      </dialog>
    </>
  );
}
