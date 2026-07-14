import { Prisma, UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { isAdminModule } from '@/lib/admin-modules';
import { prisma } from '@/lib/prisma';
import { requireAdminModule } from '@/lib/rbac';

const USER_ROLES: UserRole[] = ['super_admin', 'admin', 'user'];

type UpdateUserPayload = {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  isActive?: unknown;
  adminModules?: unknown;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  adminModules: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      submissions: true,
      attempts: true,
      tracking: true,
      diagnostics: true
    }
  }
} satisfies Prisma.UserSelect;

const errorResponse = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  if (message === 'UNAUTHORIZED') {
    return NextResponse.json({ ok: false, message: 'Session expirée.' }, { status: 401 });
  }
  if (message === 'FORBIDDEN') {
    return NextResponse.json({ ok: false, message: 'Action non autorisée.' }, { status: 403 });
  }
  console.error('Admin user API error:', error);
  return NextResponse.json({ ok: false, message: 'Erreur serveur.' }, { status: 500 });
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminModule('users');
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Utilisateur introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminModule('users');
    const { id } = await params;
    const payload = (await request.json()) as UpdateUserPayload;
    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) {
      return NextResponse.json({ ok: false, message: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const isSuperAdmin = session.role === 'super_admin';
    if (!isSuperAdmin && target.role !== 'user') {
      return NextResponse.json(
        { ok: false, message: 'Seul un super administrateur peut modifier un compte administrateur.' },
        { status: 403 }
      );
    }

    const data: Prisma.UserUpdateInput = {};
    const changedFields: string[] = [];

    if (payload.name !== undefined) {
      if (typeof payload.name !== 'string' || payload.name.trim().length > 100) {
        return NextResponse.json({ ok: false, message: 'Le nom est invalide.' }, { status: 400 });
      }
      data.name = payload.name.trim() || null;
      changedFields.push('name');
    }

    if (payload.email !== undefined) {
      const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
      if (!email || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json({ ok: false, message: 'L’adresse email est invalide.' }, { status: 400 });
      }
      data.email = email;
      changedFields.push('email');
    }

    if (payload.role !== undefined) {
      if (typeof payload.role !== 'string' || !USER_ROLES.includes(payload.role as UserRole)) {
        return NextResponse.json({ ok: false, message: 'Le rôle est invalide.' }, { status: 400 });
      }
      if (!isSuperAdmin && payload.role !== target.role) {
        return NextResponse.json({ ok: false, message: 'Le changement de rôle est réservé au super administrateur.' }, { status: 403 });
      }
      if (id === session.id && payload.role !== target.role) {
        return NextResponse.json({ ok: false, message: 'Vous ne pouvez pas modifier votre propre rôle.' }, { status: 400 });
      }
      data.role = payload.role as UserRole;
      changedFields.push('role');
    }

    if (payload.adminModules !== undefined) {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { ok: false, message: 'Les modules sont modifiables uniquement par un super administrateur.' },
          { status: 403 }
        );
      }
      if (!Array.isArray(payload.adminModules) || !payload.adminModules.every(isAdminModule)) {
        return NextResponse.json({ ok: false, message: 'La liste des modules est invalide.' }, { status: 400 });
      }
      const modules = Array.from(new Set(payload.adminModules));
      const resultingRole = typeof payload.role === 'string' ? payload.role : target.role;
      if (resultingRole === 'admin' && modules.length === 0) {
        return NextResponse.json({ ok: false, message: 'Sélectionnez au moins un module pour cet administrateur.' }, { status: 400 });
      }
      data.adminModules = { set: resultingRole === 'admin' ? modules : [] };
      changedFields.push('adminModules');
    } else if (payload.role === 'user') {
      data.adminModules = { set: [] };
    } else if (payload.role === 'admin' && target.role !== 'admin') {
      return NextResponse.json(
        { ok: false, message: 'Sélectionnez les modules du nouvel administrateur.' },
        { status: 400 }
      );
    }

    if (payload.isActive !== undefined) {
      if (typeof payload.isActive !== 'boolean') {
        return NextResponse.json({ ok: false, message: 'Le statut est invalide.' }, { status: 400 });
      }
      if (id === session.id && !payload.isActive) {
        return NextResponse.json({ ok: false, message: 'Vous ne pouvez pas désactiver votre propre compte.' }, { status: 400 });
      }
      data.isActive = payload.isActive;
      changedFields.push('isActive');
    }

    const removesActiveSuperAdmin =
      target.role === 'super_admin' &&
      target.isActive &&
      (payload.isActive === false || (payload.role !== undefined && payload.role !== 'super_admin'));

    if (removesActiveSuperAdmin) {
      const activeSuperAdmins = await prisma.user.count({
        where: { role: 'super_admin', isActive: true }
      });
      if (activeSuperAdmins <= 1) {
        return NextResponse.json(
          { ok: false, message: 'Le dernier super administrateur actif ne peut pas être désactivé ou rétrogradé.' },
          { status: 400 }
        );
      }
    }

    if (changedFields.length === 0) {
      return NextResponse.json({ ok: false, message: 'Aucune modification transmise.' }, { status: 400 });
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data, select: userSelect });
      await tx.trackingEvent.create({
        data: {
          userId: session.id,
          eventName: 'admin_user_updated',
          eventCategory: 'administration',
          path: '/admin/utilisateurs',
          metadata: { targetUserId: id, changedFields }
        }
      });
      return updated;
    });

    return NextResponse.json({ ok: true, message: 'Utilisateur mis à jour.', user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: false, message: 'Cette adresse email est déjà utilisée.' }, { status: 409 });
    }
    return errorResponse(error);
  }
}
