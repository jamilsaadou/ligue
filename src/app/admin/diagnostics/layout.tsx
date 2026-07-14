import AdminModuleAccess from '@/components/admin/AdminModuleAccess';

export default function DiagnosticsLayout({ children }: { children: React.ReactNode }) {
  return <AdminModuleAccess module="diagnostics">{children}</AdminModuleAccess>;
}
