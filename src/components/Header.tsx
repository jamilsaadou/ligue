'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Phone, Home, FileText, Users, HelpCircle, LogIn, UserPlus, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import UserMenu from './UserMenu';
import { useSiteConfig } from '@/hooks/useSiteConfig';

type UserData = {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  name: string | null;
};

export default function Header() {
  const siteConfig = useSiteConfig();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    document.title = `${siteConfig.siteName} - ${siteConfig.siteTagline}`;
    if (siteConfig.logoDataUrl) {
      let favicon = document.querySelector<HTMLLinkElement>('link[data-site-logo]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.dataset.siteLogo = 'true';
        document.head.appendChild(favicon);
      }
      favicon.href = siteConfig.logoDataUrl;
    } else {
      document.querySelector<HTMLLinkElement>('link[data-site-logo]')?.remove();
    }
  }, [siteConfig.logoDataUrl, siteConfig.siteName, siteConfig.siteTagline]);

  const mainNavLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/diagnostic', label: 'Diagnostic', icon: FileText },
    { href: '/ressources', label: 'Ressources', icon: HelpCircle },
    { href: '/a-propos', label: 'À propos', icon: Users },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const emergencyHref = `tel:${siteConfig.emergencyNumber.replace(/[^\d+]/g, '')}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {siteConfig.logoDataUrl ? (
                  <Image src={siteConfig.logoDataUrl} alt={`Logo ${siteConfig.siteName}`} width={48} height={48} unoptimized className="w-full h-full object-contain bg-white p-1" />
                ) : (
                  <Heart className="w-6 h-6 text-white" />
                )}
              </motion.div>
              <div className="hidden sm:block min-w-0 max-w-64">
                <h1 className="text-xl font-bold text-slate-900 group-hover:text-[#eb5f2a] transition-colors truncate">
                  {siteConfig.siteName}
                </h1>
                <p className="text-xs text-slate-500 truncate">{siteConfig.siteTagline}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Auth or User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
              ) : user ? (
                <UserMenu user={user} />
              ) : (
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
                    className="px-4 py-2.5 rounded-xl bg-[#eb5f2a] text-white hover:bg-[#d14d1a] transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inscription
                  </Link>
                </>
              )}

              <motion.a
                href={emergencyHref}
                className="glass-button flex items-center gap-2 text-sm !py-3 !px-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-4 h-4" />
                Urgence
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
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
            className="md:hidden glass border-b border-slate-200/80 overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
              {mainNavLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5 text-[#eb5f2a]" />
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth section for mobile */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                {isLoading ? (
                  <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center text-white text-sm font-semibold">
                        {(user.name || user.email.split('@')[0]).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.name || user.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
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
                          <LayoutDashboard className="w-5 h-5 text-[#eb5f2a]" />
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
                        <Settings className="w-5 h-5 text-[#eb5f2a]" />
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
                          await fetch('/api/auth/logout', { method: 'POST' });
                          setUser(null);
                          setIsMenuOpen(false);
                          window.location.href = '/';
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
                      >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                      </button>
                    </motion.div>
                  </>
                ) : (
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
                        <LogIn className="w-5 h-5 text-[#eb5f2a]" />
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
                        <UserPlus className="w-5 h-5 text-[#eb5f2a]" />
                        Inscription
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>

              <motion.a
                href={emergencyHref}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-button flex items-center justify-center gap-2 mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="w-4 h-4" />
                Appel d’urgence
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
