import { prisma } from "@/lib/prisma";
import { requireAdminModule } from "@/lib/rbac";
import { hasAdminModule } from "@/lib/admin-modules";
import DiagnosticsManager from "@/components/admin/DiagnosticsManager";

export default async function AdminDiagnosticsPage() {
  const session = await requireAdminModule("diagnostics");
  const diagnostics = await prisma.diagnostic.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      categories: { select: { _count: { select: { questions: true } } } },
      _count: { select: { submissions: true, attempts: true } },
    },
  });
  return (
    <DiagnosticsManager
      canViewStatistics={hasAdminModule(
        session.role,
        session.adminModules,
        "statistics",
      )}
      diagnostics={diagnostics.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        version: item.version,
        updatedAt: item.updatedAt.toISOString(),
        categories: item.categories.length,
        questions: item.categories.reduce(
          (sum, category) => sum + category._count.questions,
          0,
        ),
        submissions: item._count.submissions,
        attempts: item._count.attempts,
      }))}
    />
  );
}
