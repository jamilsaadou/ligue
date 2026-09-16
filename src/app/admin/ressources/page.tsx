import { requireAdminModule } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import ResourcesManager from "@/components/admin/ResourcesManager";

export default async function AdminResourcesPage() {
  await requireAdminModule("resources");
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
  });
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ResourcesManager countries={countries} resources={resources} />;
}
