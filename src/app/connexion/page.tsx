'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Identifiants invalides.');
        setIsLoading(false);
        return;
      }

      if (data?.role === 'admin') {
        router.push('/admin/statistiques');
        return;
      }

      router.push('/diagnostic');
    } catch (err) {
      console.error(err);
      setError('Impossible de se connecter. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10 flex items-center justify-center">
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="glass-card p-7 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Connexion
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Accédez à votre espace. Les administrateurs pourront consulter les statistiques.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="glass-input flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  className="bg-transparent outline-none w-full text-slate-900"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="glass-input flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  className="bg-transparent outline-none w-full text-slate-900"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>Vous n'avez pas de compte ? Contactez un administrateur.</span>
            <Link href="/" className="text-[#eb5f2a] font-medium hover:underline">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
