'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteConfig = useSiteConfig();
  const emergencyHref = `tel:${siteConfig.emergencyNumber.replace(/[^\d+]/g, '')}`;

  const quickLinks = [
    { href: '/diagnostic', label: 'Commencer le diagnostic' },
    { href: '/ressources', label: 'Ressources d\'aide' },
    { href: '/a-propos', label: 'À propos de la LNDF' },
  ];

  const legalLinks = [
    { href: '/confidentialite', label: 'Confidentialité' },
    { href: '/mentions-legales', label: 'Mentions légales' },
  ];

  return (
    <footer className="relative mt-12">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-100/80 to-transparent pointer-events-none" />

      <div className="glass border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  {siteConfig.logoDataUrl ? (
                    <Image src={siteConfig.logoDataUrl} alt={`Logo ${siteConfig.siteName}`} width={48} height={48} unoptimized className="w-full h-full object-contain bg-white p-1" />
                  ) : (
                    <Heart className="w-6 h-6 text-white" />
                  )}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#eb5f2a] transition-colors">
                    {siteConfig.siteName}
                  </h2>
                  <p className="text-xs text-slate-500">{siteConfig.siteTagline}</p>
                </div>
              </Link>
              
              <p className="text-slate-600 leading-relaxed mb-6 max-w-md">
                {siteConfig.siteDescription}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {[
                  { icon: Facebook, href: '#' },
                  { icon: Twitter, href: '#' },
                  { icon: Instagram, href: '#' },
                ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#eb5f2a] hover:border-[#eb5f2a]/50 transition-all"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-slate-900 font-semibold mb-6">Liens rapides</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-[#eb5f2a] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#eb5f2a]/50 group-hover:bg-[#eb5f2a] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-[#eb5f2a] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#eb5f2a]/50 group-hover:bg-[#eb5f2a] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-slate-900 font-semibold mb-6">Contact</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-slate-600 hover:text-[#eb5f2a] transition-colors flex items-start gap-3"
                  >
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{siteConfig.supportEmail}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={emergencyHref}
                    className="text-slate-600 hover:text-[#eb5f2a] transition-colors flex items-start gap-3"
                  >
                    <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block">Urgence : {siteConfig.emergencyNumber}</span>
                      <span className="text-xs text-slate-400">Police Secours</span>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{siteConfig.siteLocation}</span>
                </li>
                {siteConfig.supportPhone && (
                  <li>
                    <a href={`tel:${siteConfig.supportPhone.replace(/[^\d+]/g, '')}`} className="text-slate-600 hover:text-[#eb5f2a] transition-colors flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{siteConfig.supportPhone}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Emergency Banner */}
          <motion.div
            className="mt-10 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-semibold">Besoin d’aide urgente ?</h4>
                  <p className="text-slate-600 text-sm">En cas de danger immédiat, appelez les secours</p>
                </div>
              </div>
              <motion.a
                href={emergencyHref}
                className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-5 h-5" />
                Appeler le {siteConfig.emergencyNumber}
              </motion.a>
            </div>
          </motion.div>

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm text-center md:text-left">
                © {currentYear} {siteConfig.siteName} - {siteConfig.organizationName}. Tous droits réservés.
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span>Fait avec</span>
                <Heart className="w-4 h-4 text-[#eb5f2a]" />
                <span>au Niger</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
