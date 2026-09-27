'use client';

import { useSiteConfig } from '@/hooks/useSiteConfig';
import { NIGER_EMERGENCY_CONTACTS, phoneLink, whatsappLink } from '@/lib/contacts';

export default function SupportContacts() {
  const config = useSiteConfig();
  const whatsapp = whatsappLink(config.clinicWhatsapp);
  return (
    <div className="space-y-8">
      <section id="clinique-juridique" className="scroll-mt-28">
        <h2 className="text-xl font-bold text-slate-900">Clinique juridique de la Ligue</h2>
        <p className="mt-2 text-sm text-slate-600">Écoute, soutien psychologique et accompagnement juridique.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {whatsapp ? <a className="glass-button inline-flex" href={whatsapp} target="_blank" rel="noopener noreferrer">Écrire sur WhatsApp</a> : <p className="text-sm text-slate-600">Le contact WhatsApp de la clinique sera disponible prochainement.</p>}
          {[
            { name: 'Psychologues', phone: config.clinicPsychologistPhone },
            { name: 'Gestionnaires de cas', phone: config.clinicCaseManagerPhone },
          ].map(({ name, phone }) => phoneLink(phone) && <a key={name} className="glass-button-outline" href={phoneLink(phone)!}>{name} : {phone}</a>)}
        </div>
      </section>
      <section id="urgences-niger" className="scroll-mt-28">
        <h2 className="text-xl font-bold text-slate-900">Besoin d’aide urgente au Niger ?</h2>
        <p className="mt-2 text-sm text-slate-600">En cas de danger immédiat, appelez les secours depuis un téléphone au Niger.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {NIGER_EMERGENCY_CONTACTS.map(({ label, number }) => <a key={number} href={`tel:${number}`} className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"><span>{label}</span><strong className="text-xl">{number}</strong></a>)}
        </div>
      </section>
    </div>
  );
}
