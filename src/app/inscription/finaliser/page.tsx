'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Phone, ArrowRight, CheckCircle2, ClipboardList } from 'lucide-react';
import { COUNTRIES, JOIN_REASONS, findCountry } from '@/data/onboarding';
import { useAuth } from '@/components/AuthProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [countryCode, setCountryCode] = useState('');
  const [phoneNational, setPhoneNational] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Accès réservé aux utilisateurs connectés (l'onboarding suit l'inscription).
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);

  const selectedCountry = useMemo(() => findCountry(countryCode), [countryCode]);

  const toggleReason = (id: string) => {
    setReasons((prev) =>
      prev.includes(id) ? prev.filter((reason) => reason !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!countryCode) {
      setError('Veuillez sélectionner votre pays.');
      return;
    }
    if (phoneNational.replace(/\D/g, '').length < 6) {
      setError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (reasons.length === 0) {
      setError('Sélectionnez au moins une raison.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, phoneNational, joinReasons: reasons })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data?.message || 'Enregistrement impossible.');
        setIsSaving(false);
        return;
      }
      router.push('/compte');
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion. Réessayez.');
      setIsSaving(false);
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
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Bienvenue{user?.name ? `, ${user.name}` : ''} !
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Encore quelques informations pour personnaliser votre expérience et vous
              orienter vers les ressources adaptées à votre pays.
            </p>
          </div>

          <form className="space-y-7" onSubmit={handleSubmit}>
            {/* Pays */}
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium text-slate-700">
                Votre pays
              </label>
              <div className="glass-input flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <select
                  id="country"
                  className="bg-transparent outline-none w-full text-slate-900"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Sélectionnez votre pays
                  </option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.dialCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Téléphone avec indicatif concordant */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Numéro de téléphone
              </label>
              <div className="glass-input flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-slate-500 font-medium whitespace-nowrap">
                  {selectedCountry ? selectedCountry.dialCode : '+—'}
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="90 12 34 56"
                  className="bg-transparent outline-none w-full text-slate-900 disabled:cursor-not-allowed"
                  value={phoneNational}
                  onChange={(event) => setPhoneNational(event.target.value.replace(/[^\d\s]/g, ''))}
                  disabled={!countryCode}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                L’indicatif est automatiquement associé au pays sélectionné.
              </p>
            </div>

            {/* Raisons d'inscription */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-slate-400" />
                <span className="block text-sm font-medium text-slate-700">
                  Pourquoi rejoignez-vous la plateforme ?
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {JOIN_REASONS.map((reason) => {
                  const checked = reasons.includes(reason.id);
                  return (
                    <label
                      key={reason.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                        checked
                          ? 'border-[#eb5f2a] bg-[#eb5f2a]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#eb5f2a]"
                        checked={checked}
                        onChange={() => toggleReason(reason.id)}
                      />
                      <span className="text-sm text-slate-700">{reason.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSaving}
              className="glass-button w-full flex items-center justify-center gap-2 disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? 'Enregistrement...' : 'Terminer mon inscription'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/compte" className="text-sm text-slate-500 hover:text-slate-700">
              Passer pour l’instant
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
