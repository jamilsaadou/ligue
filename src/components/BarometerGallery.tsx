import Image from 'next/image';
import { Download, ExternalLink } from 'lucide-react';

const posters = [
  { slug: 'violentometre', title: 'Le violentomètre' },
  { slug: 'harcelometre', title: 'Le harcélomètre' },
  { slug: 'incestometre', title: 'Violentomètre contre l’inceste' },
  { slug: 'violences-economiques', title: 'Baromètre des violences économiques' },
  { slug: 'cyber-violentoscope', title: 'Cyber-violentoscope' },
];

export default function BarometerGallery() {
  return (
    <section id="barometres" className="page-container scroll-mt-28 py-12" aria-labelledby="barometres-title">
      <h2 id="barometres-title" className="text-3xl font-bold text-slate-900">Tous les baromètres</h2>
      <p className="mt-3 text-slate-600">Consultez les affiches en grand format ou téléchargez-les pour les garder à portée de main.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posters.map(({ slug, title }) => {
          const src = `/barometres/${slug}.jpg`;
          return (
            <article key={slug} className="flex flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white">
              <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Voir l’image : ${title} (nouvel onglet)`} className="relative block h-72 border-b border-slate-100 bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600">
                <Image src={src} alt={`Affiche : ${title}`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-contain p-4" />
              </a>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Voir l’image : ${title} (nouvel onglet)`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-800 hover:bg-orange-50">
                    <ExternalLink size={16} aria-hidden="true" />Voir l’image
                  </a>
                  <a href={src} download={`${slug}.jpg`} aria-label={`Télécharger : ${title} (JPG)`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800">
                    <Download size={16} aria-hidden="true" />Télécharger
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
