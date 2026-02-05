'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle, Shield, MessageCircle } from 'lucide-react';

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Emergency Button */}
      <motion.button
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
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[1002]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="glass-card p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Urgence</h3>
                      <p className="text-slate-500 text-sm">Numéros d'aide immédiate</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-[#eb5f2a]/50 transition-all group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#eb5f2a]/20 flex items-center justify-center">
                          <contact.icon className="w-5 h-5 text-[#eb5f2a]" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">{contact.country}</p>
                          <p className="text-slate-500 text-sm">{contact.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#eb5f2a] group-hover:text-slate-900 transition-colors">
                          {contact.number}
                        </span>
                        <Phone className="w-5 h-5 text-slate-400 group-hover:text-[#eb5f2a] transition-colors" />
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
                    <span>Voir toutes les ressources d'aide</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
