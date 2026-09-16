'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Mail, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function InscriptionPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Inscription impossible.');
        setIsLoading(false);
        return;
      }

      // Met à jour la barre de navigation, puis lance l'étape d'onboarding.
      await refresh();
      router.push('/inscription/finaliser');
    } catch (err) {
      console.error(err);
      setError('Impossible de créer le compte. Réessayez.');
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
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Créer un compte
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Créez votre compte pour enregistrer vos accès et suivre votre activité.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Nom (optionnel)
              </label>
              <div className="glass-input flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="bg-transparent outline-none w-full text-slate-900"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>

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
              {isLoading ? 'Création...' : 'Créer mon compte'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>Déjà un compte ?</span>
            <Link href="/login" className="text-[#eb5f2a] font-medium hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
