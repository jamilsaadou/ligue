import Image from 'next/image';
import LigueContacts from '@/components/LigueContacts';

export default function LigueResource() {
  return (
    <section className="page-container py-10" aria-labelledby="ligue-resource-title">
      <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Image src="/brand/logo-ligue.png" alt="Logo de la Ligue" width={88} height={88} className="h-22 w-22 shrink-0 object-contain" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Écoute et accompagnement au Niger</p>
            <h2 id="ligue-resource-title" className="mt-2 text-2xl font-bold text-slate-900">Ligue Nigérienne des Droits des Femmes</h2>
            <p className="mt-3 text-slate-600">Quelle que soit votre situation, la Ligue est là pour vous. Contactez notre équipe pour un accompagnement juridique ou un soutien psychologique.</p>
          </div>
        </div>
        <div className="mt-6"><LigueContacts /></div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-orange-800">
          <a href="mailto:liguenigerienne@gmail.com" className="underline underline-offset-4">liguenigerienne@gmail.com</a>
          <a href="https://liguenigerienne.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Site de la Ligue (nouvel onglet)</a>
        </div>
      </div>
    </section>
  );
}
