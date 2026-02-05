import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales | Alerte Violence',
  description: "Informations légales relatives au site Alerte Violence."
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-7 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-4">
              Informations légales
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Mentions légales
            </h1>
            <p className="text-slate-600">
              Informations sur l’éditeur, l’hébergement et la propriété intellectuelle.
            </p>
          </div>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Éditeur</h2>
              <p>Ligue Nigérienne des Droits des Femmes (LNDF)</p>
              <p>Contact : lndf.niger@gmail.com</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Responsable de publication
              </h2>
              <p>LNDF (à préciser si nécessaire).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Hébergement</h2>
              <p>Informations d’hébergement à compléter.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Propriété intellectuelle
              </h2>
              <p>
                L’ensemble du contenu du site (textes, visuels, logo, identité) est protégé
                par le droit d’auteur. Toute reproduction est interdite sans autorisation
                préalable.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
