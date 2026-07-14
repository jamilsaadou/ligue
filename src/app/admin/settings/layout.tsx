import AdminModuleAccess from '@/components/admin/AdminModuleAccess';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AdminModuleAccess module="settings">{children}</AdminModuleAccess>;
}
