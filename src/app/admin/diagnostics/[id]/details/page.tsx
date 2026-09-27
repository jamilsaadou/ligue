import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Layers3, ListChecks, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminModule } from "@/lib/rbac";
import { hasAdminModule } from "@/lib/admin-modules";
import DiagnosticRowActions from "@/components/admin/DiagnosticRowActions";

export default async function DiagnosticDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminModule("diagnostics");
  const { id } = await params;
  const diagnostic = await prisma.diagnostic.findUnique({
    where: { id },
    include: {
      _count: { select: { submissions: true, attempts: true } },
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          questions: {
            orderBy: { sortOrder: "asc" },
            include: { options: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!diagnostic) notFound();
  const labels = { active: "Actif", draft: "Brouillon", archived: "Archivé" };
  const metrics = [
    { label: "Catégories", value: diagnostic.categories.length, icon: Layers3 },
    {
      label: "Questions",
      value: diagnostic.categories.reduce(
        (sum, category) => sum + category.questions.length,
        0,
      ),
      icon: ListChecks,
    },
    {
      label: "Résultats enregistrés",
      value: diagnostic._count.submissions,
      icon: Send,
    },
  ];
  return (
    <div className="space-y-6">
      <Link
        href="/admin/diagnostics"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Tous les diagnostics
      </Link>
      <header className="glass-card p-5 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Eye size={18} aria-hidden="true" />
          Détails du questionnaire
        </div>
        <h1 className="mt-3 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
          {diagnostic.title}
        </h1>
        <p className="mt-3 whitespace-pre-line break-words text-sm text-slate-600">
          {diagnostic.description || "Aucune description renseignée."}
        </p>
        <div className="my-5 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {labels[diagnostic.status]}
          </span>
          <span>Version {diagnostic.version}</span>
          <span>
            Mis à jour le{" "}
            {diagnostic.updatedAt.toLocaleDateString("fr-FR", {
              timeZone: "UTC",
            })}
          </span>
        </div>
        <DiagnosticRowActions
          diagnosticId={id}
          diagnosticTitle={diagnostic.title}
          submissions={diagnostic._count.submissions}
          attempts={diagnostic._count.attempts}
          canViewStatistics={hasAdminModule(
            session.role,
            session.adminModules,
            "statistics",
          )}
          hideDetails
        />
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-5">
            <Icon size={20} className="text-[#f15b24]" aria-hidden="true" />
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <section className="space-y-4" aria-labelledby="content-title">
        <div>
          <h2 id="content-title" className="text-xl font-bold text-slate-900">
            Contenu du questionnaire
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consultez les questions et le barème de chaque réponse.
          </p>
        </div>
        {diagnostic.categories.map((category, index) => (
          <details
            key={category.id}
            open={index === 0}
            className="glass-card p-5 sm:p-6"
          >
            <summary className="cursor-pointer break-words font-semibold text-slate-900">
              {category.name}
              <span className="ml-2 text-xs font-normal text-slate-500">
                ({category.questions.length} questions)
              </span>
            </summary>
            {category.description && (
              <p className="mt-3 break-words text-sm text-slate-500">
                {category.description}
              </p>
            )}
            <ol className="mt-5 space-y-5">
              {category.questions.map((question, questionIndex) => (
                <li
                  key={question.id}
                  className="border-t border-slate-100 pt-4"
                >
                  <h3 className="break-words text-sm font-semibold text-slate-800">
                    {questionIndex + 1}. {question.text}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                      >
                        <span className="min-w-0 break-words">
                          {option.text}
                        </span>
                        <span className="shrink-0 font-medium text-slate-800">
                          {option.points} pt
                          {Math.abs(option.points) > 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!question.options.length && (
                    <p className="mt-2 text-sm text-slate-500">
                      Aucune réponse configurée.
                    </p>
                  )}
                </li>
              ))}
            </ol>
            {!category.questions.length && (
              <p className="text-sm text-slate-500">
                Cette catégorie ne contient pas encore de questions.
              </p>
            )}
          </details>
        ))}
        {!diagnostic.categories.length && (
          <div className="glass-card p-6 text-sm text-slate-500">
            Ce questionnaire ne contient pas encore de catégories. Utilisez «
            Modifier » pour préparer son contenu.
          </div>
        )}
      </section>
    </div>
  );
}
