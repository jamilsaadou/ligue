import AdminModuleAccess from '@/components/admin/AdminModuleAccess';

export default function LogsLayout({ children }: { children: React.ReactNode }) {
  return <AdminModuleAccess module="logs">{children}</AdminModuleAccess>;
}
