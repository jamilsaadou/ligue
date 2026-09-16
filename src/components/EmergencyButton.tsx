'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, X, AlertTriangle, Shield, MessageCircle } from 'lucide-react';

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog?.close();
    };
  }, [isOpen]);

  const emergencyContacts = [
    { 
      country: 'Niger', 
      number: '17', 
      label: 'Police Secours',
      icon: Shield
    },
    { 
      country: 'Mali', 
      number: '17', 
      label: 'Police Secours',
      icon: Shield
    },
    { 
      country: 'Sénégal', 
      number: '17', 
      label: 'Police Secours',
      icon: Shield
    },
    { 
      country: 'Côte d\'Ivoire', 
      number: '110', 
      label: 'Police Secours',
      icon: Shield
    },
  ];

  return (
    <div id="emergency-button">
      {/* Emergency Button */}
      <motion.button
        type="button"
        aria-label="Afficher les numéros d’urgence"
        aria-haspopup="dialog"
        className="emergency-button pulse-glow"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Phone className="w-6 h-6 text-white" />
      </motion.button>

      {/* Emergency Modal */}
        {isOpen && (
            <dialog
              ref={dialogRef}
              aria-labelledby="emergency-title"
              onCancel={() => setIsOpen(false)}
              onClose={() => setIsOpen(false)}
              onClick={(event) => {
                if (event.target === event.currentTarget) setIsOpen(false);
              }}
              className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
              <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h2 id="emergency-title" className="text-xl font-bold text-slate-900">Urgence</h2>
                      <p className="text-slate-500 text-sm">Numéros d&apos;aide immédiate</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Fermer les numéros d’urgence"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Warning Message */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                  <p className="text-slate-700 text-sm">
                    <strong className="text-red-600">En danger immédiat ?</strong><br />
                    Appelez les secours. Votre sécurité est la priorité.
                  </p>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <motion.a
                      key={index}
                      href={`tel:${contact.number}`}
                      className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-[#eb5f2a]/50 transition-all group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-[#eb5f2a]/20 flex items-center justify-center">
                          <contact.icon className="w-5 h-5 text-[#eb5f2a]" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">{contact.country}</p>
                          <p className="text-slate-500 text-sm">{contact.label}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-2xl font-bold text-[#eb5f2a] group-hover:text-slate-900 transition-colors">
                          {contact.number}
                        </span>
                        <Phone className="hidden sm:block w-5 h-5 text-slate-400 group-hover:text-[#eb5f2a] transition-colors" />
                      </div>
                    </motion.a>
                  ))}
                </div>

                {/* Additional Resources */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <a
                    href="/ressources"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#eb5f2a]/10 border border-[#eb5f2a]/30 text-[#eb5f2a] hover:bg-[#eb5f2a]/20 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Voir toutes les ressources d&apos;aide</span>
                  </a>
                </div>
              </div>
            </dialog>
        )}
    </div>
  );
}
