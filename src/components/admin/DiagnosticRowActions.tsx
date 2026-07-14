'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export default function DiagnosticRowActions({
  diagnosticId,
  diagnosticTitle
}: {
  diagnosticId: string;
  diagnosticTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Supprimer définitivement le diagnostic "${diagnosticTitle}" ?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/diagnostics/${diagnosticId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        window.alert(data?.message || 'Impossible de supprimer le diagnostic.');
        return;
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert('Impossible de supprimer le diagnostic.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/diagnostics/${diagnosticId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#eb5f2a]/40 hover:text-[#eb5f2a]"
      >
        <Pencil className="w-3.5 h-3.5" />
        Modifier
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {isDeleting ? 'Suppression...' : 'Supprimer'}
      </button>
    </div>
  );
}
