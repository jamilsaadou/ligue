'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FileClock,
  MapPin,
  Settings,
  BarChart3,
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { hasAdminModule, type AdminModuleKey } from '@/lib/admin-modules';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, module: null },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3, module: 'statistics' },
  { href: '/admin/diagnostics', label: 'Diagnostics', icon: ClipboardCheck, module: 'diagnostics' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, module: 'users' },
  { href: '/admin/logs', label: 'Logs & tracking', icon: FileClock, module: 'logs' },
  { href: '/admin/ressources', label: 'Ressources', icon: MapPin, module: 'resources' },
  { href: '/admin/settings', label: 'Configuration', icon: Settings, module: 'settings' }
] satisfies Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  module: AdminModuleKey | null;
}>;

export default function AdminSidebar({
  role,
  adminModules
}: {
  role: string;
  adminModules: readonly string[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.module || hasAdminModule(role, adminModules, item.module)
  );

  return (
    <div className="lg:h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 lg:p-7 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#eb5f2a] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Console LNDF</div>
            <div className="text-xs text-slate-400">
              {role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="lg:hidden rounded-lg p-3 text-white hover:bg-slate-800"
          aria-label={isOpen ? 'Fermer le menu administration' : 'Ouvrir le menu administration'}
          aria-expanded={isOpen}
          aria-controls="admin-navigation"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div id="admin-navigation" className={`${isOpen ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col lg:flex`}>
      {/* Navigation */}
      <nav aria-label="Administration" className="flex-1 p-5 space-y-2 overflow-y-auto">
        <div className="text-xs uppercase tracking-wider text-slate-500 px-3 py-2">
          Menu principal
        </div>
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
          const isExactDashboard = item.href === '/admin' && pathname === '/admin';
          const active = isActive || isExactDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-[#eb5f2a] text-white shadow-lg shadow-[#eb5f2a]/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Retour au site
        </Link>
      </div>
      </div>
    </div>
  );
}
