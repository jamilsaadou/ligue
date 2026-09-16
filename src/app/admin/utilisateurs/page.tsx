import { Prisma, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import UsersManager, {
  type AdminUserListItem,
} from "@/components/admin/UsersManager";
import { requireAdminModule } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
const ROLES: UserRole[] = ["super_admin", "admin", "user"];

const usersHref = (
  page: number,
  query: string,
  role: string,
  status: string,
) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (query) params.set("q", query);
  if (role !== "all") params.set("role", role);
  if (status !== "all") params.set("status", status);
  return `/admin/utilisateurs?${params.toString()}`;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminModule("users");

  const params = await searchParams;
  const pageParam = Number(
    Array.isArray(params.page) ? params.page[0] : params.page,
  );
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const query = String(
    Array.isArray(params.q) ? params.q[0] || "" : params.q || "",
  )
    .trim()
    .slice(0, 100);
  const requestedRole = Array.isArray(params.role)
    ? params.role[0]
    : params.role;
  const role =
    requestedRole && ROLES.includes(requestedRole as UserRole)
      ? requestedRole
      : "all";
  const requestedStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const status =
    requestedStatus === "active" || requestedStatus === "inactive"
      ? requestedStatus
      : "all";

  const where: Prisma.UserWhereInput = {
    ...(role !== "all" ? { role: role as UserRole } : {}),
    ...(status !== "all" ? { isActive: status === "active" } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, users, totalUsers, activeUsers, inactiveUsers, adminUsers] =
    await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          adminModules: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { submissions: true } },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: { in: ["admin", "super_admin"] } } }),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total > 0 && page > totalPages) {
    redirect(usersHref(totalPages, query, role, status));
  }

  const serializedUsers: AdminUserListItem[] = users.map((user) => ({
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    submissionsCount: user._count.submissions,
  }));

  return (
    <UsersManager
      users={serializedUsers}
      currentUserId={session.id}
      currentRole={session.role}
      page={Math.min(page, totalPages)}
      totalPages={totalPages}
      totalResults={total}
      query={query}
      roleFilter={role}
      statusFilter={status}
      summary={{
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
      }}
    />
  );
}
