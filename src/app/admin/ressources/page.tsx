import { prisma } from '@/lib/prisma';
import ResourcesManager from '@/components/admin/ResourcesManager';

export default async function AdminResourcesPage() {
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' }
  });
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Ressources
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Réseau d&apos;accompagnement
        </h1>
        <p className="text-slate-600 mt-2">
          Ajoutez et mettez à jour les ressources disponibles par pays.
        </p>
      </div>

      <ResourcesManager countries={countries} resources={resources} />
    </div>
  );
}
