'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Calendar,
  ClipboardCheck,
  Activity,
  ArrowRight,
  MapPin,
  Phone,
  LayoutDashboard,
  UserCog
} from 'lucide-react';
import { COUNTRIES, JOIN_REASONS, findCountry } from '@/data/onboarding';

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: 'super_admin' | 'admin' | 'user';
  countryCode: string | null;
  phone: string | null;
  joinReasons: string[];
  onboardedAt: string | null;
  createdAt: string;
  _count: { submissions: number; attempts: number };
  submissions: Array<{
    id: string;
    totalScore: number;
    maxScore: number;
    level: string;
    createdAt: string;
    diagnostic: { title: string };
  }>;
};

type Tab = 'dashboard' | 'profile';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNational, setPhoneNational] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedCountry = useMemo(() => findCountry(countryCode), [countryCode]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        const data = await response.json();

        if (!response.ok || !data.user) {
          router.push('/login');
          return;
        }

        const profile = data.user as UserProfile;
        setUser(profile);
        setName(profile.name || '');
        setCountryCode(profile.countryCode || '');
        setReasons(profile.joinReasons || []);
        // Reconstruit la partie nationale à partir du numéro stocké "+indicatif national".
        if (profile.phone) {
          const country = findCountry(profile.countryCode);
          const national = country
            ? profile.phone.replace(country.dialCode, '').trim()
            : profile.phone;
          setPhoneNational(national);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const toggleReason = (id: string) => {
    setReasons((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    if (countryCode && phoneNational.replace(/\D/g, '').length < 6) {
      setMessage({ type: 'error', text: 'Veuillez saisir un numéro de téléphone valide.' });
      return;
    }

    setIsSaving(true);

    try {
      const body: Record<string, unknown> = {
        name: name.trim() || null,
        joinReasons: reasons
      };
      if (countryCode) {
        body.countryCode = countryCode;
        body.phoneNational = phoneNational;
      }
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setMessage({ type: 'success', text: data.message || 'Profil mis à jour.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (user) {
          setUser({
            ...user,
            name: name.trim() || null,
            countryCode: countryCode || user.countryCode,
            phone: selectedCountry
              ? `${selectedCountry.dialCode} ${phoneNational.replace(/\D/g, '')}`
              : user.phone,
            joinReasons: reasons
          });
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur lors de la mise à jour.' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'profile', label: 'Informations personnelles', icon: UserCog }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Identity header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center text-white text-xl font-bold">
              {(user.name || user.email.split('@')[0]).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user.name || user.email.split('@')[0]}
              </h1>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Membre depuis le {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#eb5f2a] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 sm:p-8"
          >
            <div className="grid grid-cols-2 border-y border-slate-200 mb-8 sm:grid-cols-3">
              <div className="py-5 pr-4 sm:border-r sm:border-slate-200">
                <ClipboardCheck className="w-5 h-5 text-[#eb5f2a]" />
                <p className="mt-2 text-2xl font-bold text-slate-900">{user._count.submissions}</p>
                <p className="text-xs font-medium text-slate-500">Diagnostics terminés</p>
              </div>
              <div className="border-l border-slate-200 py-5 pl-4 sm:border-l-0 sm:px-4 sm:border-r">
                <Activity className="w-5 h-5 text-blue-600" />
                <p className="mt-2 text-2xl font-bold text-slate-900">{user._count.attempts}</p>
                <p className="text-xs font-medium text-slate-500">Tentatives</p>
              </div>
              <div className="col-span-2 border-t border-slate-200 py-5 sm:col-span-1 sm:border-t-0 sm:pl-4">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <p className="mt-2 text-base font-bold text-slate-900">
                  {user.submissions[0] ? formatDate(user.submissions[0].createdAt) : 'Aucun'}
                </p>
                <p className="text-xs font-medium text-slate-500">Dernier diagnostic</p>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Activité récente</h2>
                <Link
                  href="/diagnostic"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#d94c18] hover:text-[#b83e13]"
                >
                  Nouveau diagnostic <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {user.submissions.length ? (
                <div className="divide-y divide-slate-100 border-y border-slate-200">
                  {user.submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{submission.diagnostic.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{formatDate(submission.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {submission.totalScore}/{submission.maxScore}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            submission.level === 'danger'
                              ? 'bg-rose-50 text-rose-700'
                              : submission.level === 'warning'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {submission.level === 'danger'
                            ? 'Danger'
                            : submission.level === 'warning'
                              ? 'Vigilance'
                              : 'Sain'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-y border-slate-200 py-7 text-center text-sm text-slate-500">
                  Aucun diagnostic terminé pour le moment.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Personal information tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 sm:p-8"
          >
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identity */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Identité</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">L’adresse email ne peut pas être modifiée.</p>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Nom d’affichage
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre nom"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#eb5f2a] focus:ring-2 focus:ring-[#eb5f2a]/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Country + phone */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Coordonnées</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
                      Pays
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        id="country"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#eb5f2a] focus:ring-2 focus:ring-[#eb5f2a]/20 transition-all outline-none"
                      >
                        <option value="">Non renseigné</option>
                        {COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name} ({country.dialCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <div className="relative flex items-center gap-2 rounded-xl bg-white border border-slate-200 focus-within:border-[#eb5f2a] focus-within:ring-2 focus-within:ring-[#eb5f2a]/20 transition-all pl-4">
                      <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500 font-medium whitespace-nowrap">
                        {selectedCountry ? selectedCountry.dialCode : '+—'}
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        value={phoneNational}
                        onChange={(e) => setPhoneNational(e.target.value.replace(/[^\d\s]/g, ''))}
                        placeholder="90 12 34 56"
                        disabled={!countryCode}
                        className="w-full pr-4 py-3 bg-transparent outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      L’indicatif est automatiquement associé au pays sélectionné.
                    </p>
                  </div>
                </div>
              </div>

              {/* Join reasons */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Pourquoi j’utilise la plateforme
                </h2>
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

              {/* Password */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Changer le mot de passe</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe actuel"
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#eb5f2a] focus:ring-2 focus:ring-[#eb5f2a]/20 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Entrez un nouveau mot de passe"
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#eb5f2a] focus:ring-2 focus:ring-[#eb5f2a]/20 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Minimum 6 caractères.</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez le nouveau mot de passe"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#eb5f2a] focus:ring-2 focus:ring-[#eb5f2a]/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#eb5f2a] text-white font-medium hover:bg-[#d14d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
