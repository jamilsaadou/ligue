'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LoaderCircle,
  Mail,
  Save,
  Send,
  Trash2,
  Upload
} from 'lucide-react';
import { refreshSiteConfig } from '@/hooks/useSiteConfig';

export type AdminSettings = {
  siteName: string;
  siteTagline: string;
  organizationName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  clinicWhatsapp: string;
  clinicPsychologistPhone: string;
  clinicCaseManagerPhone: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;

  siteLocation: string;
  emergencyNumber: string;
  logoDataUrl: string;
  analyticsRetentionDays: number;
  smtpEnabled: boolean;
  notifyOnDiagnostic: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpRejectUnauthorized: boolean;
  smtpUsername: string;
  smtpPassword: string;
  smtpPasswordConfigured: boolean;
  smtpFromName: string;
  smtpFromEmail: string;
  diagnosticNotificationEmail: string;
};

type Section = 'identity' | 'email' | 'data';

const SECTIONS = [
  { id: 'identity' as const, label: 'Identité du site', icon: Building2 },
  { id: 'email' as const, label: 'Notifications SMTP', icon: Mail },
  { id: 'data' as const, label: 'Données', icon: Database }
];

export default function SettingsForm({ initial }: { initial: AdminSettings }) {
  const [form, setForm] = useState<AdminSettings>(initial);
  const [section, setSection] = useState<Section>('identity');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = <Key extends keyof AdminSettings>(key: Key, value: AdminSettings[Key]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const saveSettings = async () => {
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Erreur lors de la sauvegarde.');
    refreshSiteConfig();
    setForm((previous) => ({
      ...previous,
      smtpPassword: '',
      smtpPasswordConfigured:
        previous.smtpPasswordConfigured || Boolean(previous.smtpPassword)
    }));
    return data;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await saveSettings();
      setMessage({ text: 'Configuration enregistrée.', error: false });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Erreur réseau.',
        error: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setMessage(null);
    try {
      await saveSettings();
      const response = await fetch('/api/admin/settings/test-email', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "L’email de test n’a pas pu être envoyé.");
      setMessage({ text: data.message, error: false });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Erreur réseau.',
        error: true
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleLogo = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setMessage({ text: 'Utilisez une image PNG, JPEG ou WebP.', error: true });
      return;
    }
    if (file.size > 750 * 1024) {
      setMessage({ text: 'Le logo ne doit pas dépasser 750 Ko.', error: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update('logoDataUrl', typeof reader.result === 'string' ? reader.result : '');
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" aria-label="Sections des paramètres">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
              section === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {section === 'identity' && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <SectionHeader
            icon={Building2}
            title="Identité publique"
            description="Informations affichées dans l’en-tête et le pied de page du site."
          />
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Logo du site</label>
                <div className="h-40 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-5 overflow-hidden">
                  {form.logoDataUrl ? (
                    <Image
                      src={form.logoDataUrl}
                      alt="Aperçu du logo"
                      width={180}
                      height={110}
                      unoptimized
                      className="max-h-28 w-auto object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-9 h-9 mx-auto mb-2" />
                      <span className="text-xs">Logo par défaut</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                    <Upload className="w-4 h-4" />
                    Choisir
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => handleLogo(event.target.files?.[0])}
                    />
                  </label>
                  {form.logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => update('logoDataUrl', '')}
                      className="h-9 w-9 rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Supprimer le logo"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">PNG, JPEG ou WebP · 750 Ko maximum</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nom du site">
                  <input className="glass-input w-full" value={form.siteName} onChange={(event) => update('siteName', event.target.value)} required />
                </Field>
                <Field label="Slogan">
                  <input className="glass-input w-full" value={form.siteTagline} onChange={(event) => update('siteTagline', event.target.value)} />
                </Field>
                <Field label="Organisation" className="md:col-span-2">
                  <input className="glass-input w-full" value={form.organizationName} onChange={(event) => update('organizationName', event.target.value)} />
                </Field>
                <Field label="Description du site" className="md:col-span-2">
                  <textarea className="glass-input w-full min-h-28 resize-y" value={form.siteDescription} onChange={(event) => update('siteDescription', event.target.value)} />
                </Field>
                <Field label="Email support">
                  <input type="email" className="glass-input w-full" value={form.supportEmail} onChange={(event) => update('supportEmail', event.target.value)} />
                </Field>
                <Field label="Téléphone support">
                  <input className="glass-input w-full" value={form.supportPhone} onChange={(event) => update('supportPhone', event.target.value)} placeholder="+227..." />
                </Field>
                <Field label="WhatsApp de la clinique juridique (+227…)">
                  <input type="tel" className="glass-input w-full" value={form.clinicWhatsapp} onChange={(event) => update('clinicWhatsapp', event.target.value)} />
                </Field>
                <Field label="Téléphone des psychologues">
                  <input type="tel" className="glass-input w-full" value={form.clinicPsychologistPhone} onChange={(event) => update('clinicPsychologistPhone', event.target.value)} />
                </Field>
                <Field label="Téléphone des gestionnaires de cas">
                  <input type="tel" className="glass-input w-full" value={form.clinicCaseManagerPhone} onChange={(event) => update('clinicCaseManagerPhone', event.target.value)} />
                </Field>
                <Field label="Page Facebook officielle">
                  <input type="url" className="glass-input w-full" value={form.facebookUrl} onChange={(event) => update('facebookUrl', event.target.value)} />
                </Field>
                <Field label="Page Instagram officielle">
                  <input type="url" className="glass-input w-full" value={form.instagramUrl} onChange={(event) => update('instagramUrl', event.target.value)} />
                </Field>
                <Field label="Page X / Twitter officielle">
                  <input type="url" className="glass-input w-full" value={form.twitterUrl} onChange={(event) => update('twitterUrl', event.target.value)} />
                </Field>
                <Field label="Page YouTube officielle">
                  <input type="url" className="glass-input w-full" value={form.youtubeUrl} onChange={(event) => update('youtubeUrl', event.target.value)} />
                </Field>
                <Field label="Localisation">
                  <input className="glass-input w-full" value={form.siteLocation} onChange={(event) => update('siteLocation', event.target.value)} />
                </Field>
                <Field label="Numéro d’urgence">
                  <input className="glass-input w-full" value={form.emergencyNumber} onChange={(event) => update('emergencyNumber', event.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        </section>
      )}

      {section === 'email' && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <SectionHeader
            icon={Mail}
            title="Notifications par email"
            description="Recevez un résumé confidentiel après chaque diagnostic terminé."
          />
          <div className="p-6 md:p-8 space-y-7">
            <div className="grid gap-4 md:grid-cols-2">
              <Toggle
                label="Activer le serveur SMTP"
                description="Autorise l’envoi d’emails depuis l’application."
                checked={form.smtpEnabled}
                onChange={(checked) => update('smtpEnabled', checked)}
              />
              <Toggle
                label="Notifier chaque diagnostic"
                description="Envoie un email uniquement pour les nouvelles soumissions."
                checked={form.notifyOnDiagnostic}
                onChange={(checked) => update('notifyOnDiagnostic', checked)}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Serveur SMTP" className="md:col-span-2">
                <input className="glass-input w-full" value={form.smtpHost} onChange={(event) => update('smtpHost', event.target.value)} placeholder="smtp.exemple.com" />
              </Field>
              <Field label="Port">
                <input type="number" min={1} max={65535} className="glass-input w-full" value={form.smtpPort} onChange={(event) => update('smtpPort', Number(event.target.value))} />
              </Field>
              <Field label="Identifiant SMTP" className="md:col-span-2">
                <input className="glass-input w-full" value={form.smtpUsername} onChange={(event) => update('smtpUsername', event.target.value)} autoComplete="username" />
              </Field>
              <Field label="Mot de passe">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="glass-input w-full pr-11"
                    value={form.smtpPassword}
                    onChange={(event) => update('smtpPassword', event.target.value)}
                    autoComplete="new-password"
                    placeholder={form.smtpPasswordConfigured ? 'Déjà configuré' : 'Mot de passe SMTP'}
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" title={showPassword ? 'Masquer' : 'Afficher'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.smtpPasswordConfigured && <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Mot de passe chiffré enregistré</p>}
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Toggle label="Connexion sécurisée SSL/TLS" description="À activer généralement avec le port 465." checked={form.smtpSecure} onChange={(checked) => update('smtpSecure', checked)} />
              <Toggle label="Vérifier le certificat TLS" description="Recommandé pour les serveurs publics." checked={form.smtpRejectUnauthorized} onChange={(checked) => update('smtpRejectUnauthorized', checked)} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom de l’expéditeur">
                <input className="glass-input w-full" value={form.smtpFromName} onChange={(event) => update('smtpFromName', event.target.value)} />
              </Field>
              <Field label="Email de l’expéditeur">
                <input type="email" className="glass-input w-full" value={form.smtpFromEmail} onChange={(event) => update('smtpFromEmail', event.target.value)} placeholder="notifications@exemple.com" />
              </Field>
              <Field label="Destinataire des nouveaux diagnostics" className="md:col-span-2">
                <input type="email" className="glass-input w-full" value={form.diagnosticNotificationEmail} onChange={(event) => update('diagnosticNotificationEmail', event.target.value)} placeholder="responsable@exemple.com" />
                <p className="mt-2 text-xs text-slate-500">Ce destinataire reçoit le niveau, le score, la durée et le contexte anonyme, jamais les réponses.</p>
              </Field>
            </div>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isTesting || isSaving}
              className="glass-button-outline inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isTesting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enregistrer et envoyer un test
            </button>
          </div>
        </section>
      )}

      {section === 'data' && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <SectionHeader icon={Database} title="Conservation des données" description="Durée de conservation des événements analytics anonymes." />
          <div className="p-6 md:p-8 max-w-xl">
            <Field label="Rétention des données analytics (jours)">
              <input type="number" min={30} max={730} className="glass-input w-full" value={form.analyticsRetentionDays} onChange={(event) => update('analyticsRetentionDays', Number(event.target.value))} />
              <p className="mt-2 text-xs text-slate-500">Valeur autorisée : entre 30 jours et 2 ans.</p>
            </Field>
          </div>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="min-h-6">
          {message && (
            <p className={`flex items-center gap-2 text-sm font-medium ${message.error ? 'text-red-600' : 'text-emerald-600'}`}>
              {message.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {message.text}
            </p>
          )}
        </div>
        <button type="submit" className="glass-button flex items-center gap-2 whitespace-nowrap disabled:opacity-60" disabled={isSaving || isTesting}>
          {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les paramètres
        </button>
      </div>
    </form>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: typeof Building2; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:px-8">
      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Icon className="w-5 h-5 text-[#f15b24]" /></div>
      <div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
    </div>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="block text-sm font-semibold text-slate-700 mb-2">{label}</span>{children}</label>;
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50">
      <span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="block text-xs text-slate-500 mt-1">{description}</span></span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-[#f15b24]' : 'bg-slate-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></span>
    </label>
  );
}
