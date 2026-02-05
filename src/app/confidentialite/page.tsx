import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Alerte Violence',
  description:
    "Informations sur la protection des données et la confidentialité des utilisateurs d'Alerte Violence."
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-7 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-4">
              Confidentialité
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Politique de confidentialité
            </h1>
            <p className="text-slate-600">
              Nous protégeons vos informations et privilégions la discrétion.
            </p>
          </div>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Ce que nous faisons
              </h2>
              <p>
                Cette plateforme permet un autodiagnostic des violences. Les réponses au
                diagnostic sont traitées localement dans votre navigateur et ne sont pas
                transmises à un tiers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Données que nous pouvons traiter
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Les informations de connexion des comptes administrateurs (ex. email) pour
                  sécuriser l’accès à l’interface interne.
                </li>
                <li>
                  Des données techniques minimales nécessaires au fonctionnement du service
                  (ex. cookies de session).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Cookies</h2>
              <p>
                Nous utilisons des cookies techniques pour maintenir les sessions
                d’administration et améliorer la sécurité. Vous pouvez les supprimer via les
                réglages de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Conservation
              </h2>
              <p>
                Les données liées aux comptes administrateurs sont conservées le temps
                nécessaire à la gestion du service. Les éléments enregistrés localement dans
                votre navigateur peuvent être supprimés à tout moment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact</h2>
              <p>
                Pour toute question sur la confidentialité, contactez-nous à{' '}
                <span className="font-medium">lndf.niger@gmail.com</span>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
