import AdminModuleAccess from '@/components/admin/AdminModuleAccess';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <AdminModuleAccess module="users">{children}</AdminModuleAccess>;
}
