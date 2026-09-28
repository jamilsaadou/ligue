'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import LigueLinks from './LigueLinks';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteConfig = useSiteConfig();

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
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  {siteConfig.logoDataUrl ? (
                    <Image src={siteConfig.logoDataUrl} alt={`Logo ${siteConfig.siteName}`} width={48} height={48} unoptimized className="w-full h-full object-contain bg-white p-1" />
                  ) : (
                    <Heart className="w-6 h-6 text-white" />
                  )}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#f15b24] transition-colors">
                    {siteConfig.siteName}
                  </h2>
                  <p className="text-xs text-slate-500">{siteConfig.siteTagline}</p>
                </div>
              </Link>
              
              <p className="text-slate-600 leading-relaxed mb-6 max-w-md">
                {siteConfig.siteDescription}
              </p>


            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-slate-900 font-semibold mb-6">Liens rapides</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-[#f15b24] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f15b24]/50 group-hover:bg-[#f15b24] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-[#f15b24] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f15b24]/50 group-hover:bg-[#f15b24] transition-colors" />
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
                <li hidden={!siteConfig.supportEmail}>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-slate-600 hover:text-[#f15b24] transition-colors flex items-start gap-3"
                  >
                    <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{siteConfig.supportEmail}</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{siteConfig.siteLocation}</span>
                </li>
                {siteConfig.supportPhone && (
                  <li>
                    <a href={`tel:${siteConfig.supportPhone.replace(/[^\d+]/g, '')}`} className="text-slate-600 hover:text-[#f15b24] transition-colors flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{siteConfig.supportPhone}</span>
                    </a>
                  </li>
                )}
              </ul>
              <LigueLinks compact />
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm text-center md:text-left">
                © {currentYear} {siteConfig.siteName} - {siteConfig.organizationName}. Tous droits réservés.
              </p>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
