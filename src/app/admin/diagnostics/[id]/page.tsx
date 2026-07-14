import { notFound } from 'next/navigation';
import DiagnosticBuilder, {
  DiagnosticDraft
} from '@/components/admin/DiagnosticBuilder';
import { prisma } from '@/lib/prisma';

export default async function AdminDiagnosticEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diagnostic = await prisma.diagnostic.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          questions: {
            orderBy: { sortOrder: 'asc' },
            include: {
              options: { orderBy: { sortOrder: 'asc' } }
            }
          }
        }
      }
    }
  });

  if (!diagnostic) {
    notFound();
  }

  const initial: DiagnosticDraft = {
    id: diagnostic.id,
    title: diagnostic.title,
    description: diagnostic.description || '',
    status: diagnostic.status,
    version: diagnostic.version,
    categories: diagnostic.categories.map((category) => ({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'Heart',
      questions: category.questions.map((question) => ({
        text: question.text,
        options: question.options.map((option) => ({
          text: option.text,
          points: option.points
        }))
      }))
    }))
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Diagnostic
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Édition du questionnaire
        </h1>
        <p className="text-slate-600 mt-2">
          Modifiez les catégories, questions et options. Les changements sont enregistrés.
        </p>
      </div>
      <DiagnosticBuilder initial={initial} />
    </div>
  );
}
