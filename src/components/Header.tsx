'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, MessageCircle, Home, FileText, Users, HelpCircle, LogIn, UserPlus, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { whatsappLink } from '@/lib/contacts';
import UserMenu from './UserMenu';
import { useAuth } from './AuthProvider';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function Header() {
  const siteConfig = useSiteConfig();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const { user, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `${siteConfig.siteName} - ${siteConfig.siteTagline}`;
  }, [siteConfig.siteName, siteConfig.siteTagline]);

  const mainNavLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/diagnostic', label: 'Diagnostic', icon: FileText },
    { href: '/ressources', label: 'Ressources', icon: HelpCircle },
    { href: '/a-propos', label: 'À propos', icon: Users },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const emergencyHref = whatsappLink(siteConfig.clinicWhatsapp) || '/ressources#clinique-juridique';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isMenuOpen) {
          setIsMenuOpen(false);
          document.querySelector<HTMLButtonElement>('[aria-controls="mobile-navigation"]')?.focus();
        }
      }}
    >
      <div className="glass border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center gap-3 group" aria-label={`${siteConfig.siteName} — Accueil`}>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {siteConfig.logoDataUrl ? (
                  <Image src={siteConfig.logoDataUrl} alt={`Logo ${siteConfig.siteName}`} width={48} height={48} unoptimized className="w-full h-full object-contain bg-white p-1" />
                ) : (
                  <Heart className="w-6 h-6 text-white" />
                )}
              </motion.div>
              <div className="min-w-0 max-w-48 sm:max-w-64">
                <p className="text-sm sm:text-xl font-bold text-slate-900 group-hover:text-[#f15b24] transition-colors truncate">
                  {siteConfig.siteName}
                </p>
                <p className="hidden sm:block text-xs text-slate-500 truncate">{siteConfig.siteTagline}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Navigation principale" className="hidden xl:flex shrink-0 items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm ${isActive(link.href) ? "font-extrabold text-orange-800 bg-orange-50" : "font-medium text-slate-600 hover:bg-slate-100"}`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Auth or User Menu */}
            <div className="hidden xl:flex shrink-0 items-center gap-3">
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
              ) : user ? (
                <UserMenu user={user} />
              ) : siteConfig.publicAuthEnabled ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="px-4 py-2.5 rounded-xl bg-[#f15b24] text-white hover:bg-[#d14d1a] transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inscription
                  </Link>
                </>
              ) : null}

              <motion.a
                href={emergencyHref}
                className="glass-button flex items-center gap-2 text-sm !py-3 !px-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-4 h-4" />
                Clinique juridique
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="xl:hidden shrink-0 p-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            id="mobile-navigation"
            className="xl:hidden glass border-b border-slate-200/80 max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain"
          >
            <nav aria-label="Navigation mobile" className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
              {mainNavLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${isActive(link.href) ? "font-extrabold text-orange-800 bg-orange-50" : "font-medium text-slate-700 hover:bg-slate-100"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5 text-[#f15b24]" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth section for mobile */}
              {(isLoading || user || siteConfig.publicAuthEnabled) && <div className="mt-4 pt-4 border-t border-slate-200">
                {isLoading ? (
                  <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center text-white text-sm font-semibold">
                        {(user.name || user.email.split('@')[0]).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {user.name || user.email.split('@')[0]}
                        </p>
                        <p className="break-all text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-5 h-5 text-[#f15b24]" />
                          Tableau de bord
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Link
                        href="/compte"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5 text-[#f15b24]" />
                        {isAdmin ? 'Paramètres du compte' : 'Mon tableau de bord'}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <button
                        onClick={async () => {
                          await logout();
                          setIsMenuOpen(false);
                          router.push('/');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
                      >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                      </button>
                    </motion.div>
                  </>
                ) : siteConfig.publicAuthEnabled ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5 text-[#f15b24]" />
                        Connexion
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Link
                        href="/inscription"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus className="w-5 h-5 text-[#f15b24]" />
                        Inscription
                      </Link>
                    </motion.div>
                  </>
                ) : null}
              </div>}

              <motion.a
                href={emergencyHref}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-button flex items-center justify-center gap-2 mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                Clinique juridique
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
