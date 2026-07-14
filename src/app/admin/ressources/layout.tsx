import AdminModuleAccess from '@/components/admin/AdminModuleAccess';

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <AdminModuleAccess module="resources">{children}</AdminModuleAccess>;
}
