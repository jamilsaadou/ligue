import { diagnosticReassurance, getCategoryDefinition, getDiagnosticDefinition } from '@/data/category-introductions';

type Props = {
  name: string;
  description?: string;
  diagnosticName?: string;
  onStart: () => void;
  onBack: () => void;
};

export default function CategoryIntroduction({ name, description, diagnosticName, onStart, onBack }: Props) {
  const diagnosticDefinition = diagnosticName ? getDiagnosticDefinition(diagnosticName) : undefined;
  const title = diagnosticDefinition ? diagnosticName : name;
  const definition = diagnosticDefinition || getCategoryDefinition(name, description);
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-8 flex justify-center items-center">
      <section className="glass-card w-full max-w-2xl p-6 md:p-10" aria-labelledby="category-introduction-title">
        <h1 id="category-introduction-title" className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
        <h2 className="mt-6 font-semibold text-slate-900">Qu’est-ce qu’on entend par là ?</h2>
        <p className="mt-2 text-slate-600 leading-relaxed">{definition}</p>
        <p className="mt-6 rounded-xl bg-slate-50 p-4 text-slate-700 leading-relaxed">{diagnosticReassurance}</p>
        <h2 className="mt-6 font-semibold text-slate-900">À la fin, vous verrez un résultat en couleur :</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed">
          <li className="rounded-xl bg-green-50 p-4 text-green-900"><strong>🟢 Vert :</strong> la relation ou situation décrite ne présente pas de signes de violence identifiés ici.</li>
          <li className="rounded-xl bg-orange-50 p-4 text-orange-900"><strong>🟠 Orange :</strong> certains comportements repérés méritent votre attention. Vous n’êtes pas seule, et il peut être utile d’en parler.</li>
          <li className="rounded-xl bg-red-50 p-4 text-red-900"><strong>🔴 Rouge :</strong> la situation présente des signes sérieux. Nous vous encourageons à demander de l’aide dès maintenant.</li>
        </ul>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="glass-button flex-1" onClick={onStart}>Commencer</button>
          <button className="glass-button-outline" onClick={onBack}>Retour</button>
        </div>
      </section>
    </div>
  );
}
