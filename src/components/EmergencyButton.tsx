'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { whatsappLink } from '@/lib/contacts';
import SupportContacts from './SupportContacts';

export default function EmergencyButton() {
  const config = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; dialog?.close(); };
  }, [isOpen]);
  return <>
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <button type="button" aria-label="Afficher les contacts d’aide au Niger" aria-haspopup="dialog" onClick={() => setIsOpen(true)} className="rounded-full border border-slate-200 bg-white p-4 text-slate-700 shadow-lg"><Phone size={22} /></button>
      <a href={whatsappLink(config.clinicWhatsapp) || '/ressources#clinique-juridique'} aria-label="Contacter la clinique juridique" className="rounded-full bg-[#b73d12] p-4 text-white shadow-lg"><MessageCircle size={24} /></a>
    </div>
    {isOpen && <dialog ref={dialogRef} aria-labelledby="support-dialog-title" onCancel={() => setIsOpen(false)} onClose={() => setIsOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-black/60">
      <div className="mb-6 flex items-center justify-between gap-3"><h2 id="support-dialog-title" className="text-2xl font-bold">Contacts d’aide au Niger</h2><button autoFocus type="button" aria-label="Fermer les contacts" onClick={() => setIsOpen(false)} className="rounded-lg p-3 hover:bg-slate-100"><X /></button></div>
      <SupportContacts />
    </dialog>}
  </>;
}
