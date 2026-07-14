import AdminModuleAccess from '@/components/admin/AdminModuleAccess';

export default function StatisticsLayout({ children }: { children: React.ReactNode }) {
  return <AdminModuleAccess module="statistics">{children}</AdminModuleAccess>;
}
