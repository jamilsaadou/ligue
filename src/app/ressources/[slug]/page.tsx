import Link from 'next/link';
import { notFound } from 'next/navigation';
import barometres from '@/data/barometres.json';
import SupportContacts from '@/components/SupportContacts';

export function generateStaticParams() { return barometres.map(({ slug }) => ({ slug })); }

export default async function BarometrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = barometres.find((item) => item.slug === slug);
  if (!tool) notFound();
  const economic = slug === 'violences-economiques';
  return <article className="page-container py-12 pb-28">
    <Link href="/ressources#barometres" className="font-semibold text-orange-800">← Tous les baromètres</Link>
    <header className="my-8 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange-800">Comprendre et repérer</p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-5xl">{tool.title}</h1>
      {economic ? <>
        <p className="mt-5 text-lg text-slate-700">Les violences économiques conjugales se définissent par un contrôle, un appauvrissement ou un manque à gagner qui peuvent aller jusqu’à la dépossession totale des moyens d’autonomie financière des femmes.</p>
        <p className="mt-3 text-sm text-slate-600">Les 24 repères du baromètre de Les Glorieuses et Oseille & Compagnie. Les contacts d’aide ci-dessous sont adaptés au Niger.</p>
      </> : <p className="mt-5 text-slate-600">Retrouvez les {tool.statements.length} situations de cet outil. Ces repères vous aident à mettre des mots sur ce que vous vivez.</p>}
    </header>
    {(economic ? [
      { title: 'Profitez — votre relation est saine quand vous…', start: 0, end: 5, style: 'border-green-300 bg-green-50' },
      { title: 'Vigilance, dites stop — il y a de la violence économique quand il…', start: 5, end: 15, style: 'border-amber-300 bg-amber-50' },
      { title: 'Protégez-vous, demandez de l’aide — quand il…', start: 15, end: 24, style: 'border-red-300 bg-red-50' },
    ] : [{ title: 'Les situations à repérer', start: 0, end: tool.statements.length, style: 'border-orange-200 bg-orange-50' }]).map((group) => <section key={group.start} className={`my-6 rounded-2xl border p-5 sm:p-8 ${group.style}`}>
      <h2 className="text-xl font-bold text-slate-900">{group.title}</h2>
      <ol start={group.start + 1} className="mt-5 list-decimal space-y-3 pl-7 text-slate-800 marker:font-bold">
        {tool.statements.slice(group.start, group.end).map((text, index) => <li key={index} className="pl-2 leading-relaxed">{text}</li>)}
      </ol>
    </section>)}
    <div className="my-10"><Link href="/diagnostic" className="glass-button inline-flex">Accéder aux autodiagnostics</Link></div>
    <SupportContacts />
  </article>;
}
