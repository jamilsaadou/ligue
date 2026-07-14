import DiagnosticBuilder, {
  DiagnosticDraft
} from '@/components/admin/DiagnosticBuilder';

const initialDraft: DiagnosticDraft = {
  title: '',
  description: '',
  status: 'draft',
  version: 1,
  categories: []
};

export default function AdminDiagnosticsCreatePage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Nouveau diagnostic
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Construire un questionnaire
        </h1>
        <p className="text-slate-600 mt-2">
          Ajoutez des catégories, questions et options. La sauvegarde est automatique.
        </p>
      </div>

      <DiagnosticBuilder initial={initialDraft} />
    </div>
  );
}
