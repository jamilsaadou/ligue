import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ADMIN_MODULE_KEYS, isAdminModule } from '@/lib/admin-modules';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/rbac';

type CreateAdminPayload = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  adminModules?: unknown;
};

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin();
    const payload = (await request.json()) as CreateAdminPayload;
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';
    const modules = Array.isArray(payload.adminModules)
      ? Array.from(new Set(payload.adminModules.filter(isAdminModule)))
      : [];

    if (name.length > 100) {
      return NextResponse.json({ ok: false, message: 'Le nom est invalide.' }, { status: 400 });
    }
    if (!email || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'L’adresse email est invalide.' }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { ok: false, message: 'Le mot de passe doit contenir entre 8 et 128 caractères.' },
        { status: 400 }
      );
    }
    if (modules.length === 0 || modules.length > ADMIN_MODULE_KEYS.length) {
      return NextResponse.json(
        { ok: false, message: 'Sélectionnez au moins un module.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name || null,
          email,
          passwordHash,
          role: 'admin',
          isActive: true,
          adminModules: modules
        },
        select: { id: true, name: true, email: true, role: true, adminModules: true }
      });
      await tx.trackingEvent.create({
        data: {
          userId: session.id,
          eventName: 'admin_user_created',
          eventCategory: 'administration',
          path: '/admin/utilisateurs',
          metadata: { targetUserId: created.id, role: 'admin', adminModules: modules }
        }
      });
      return created;
    });

    return NextResponse.json({ ok: true, message: 'Administrateur créé.', user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ ok: false, message: 'Cette adresse email est déjà utilisée.' }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ ok: false, message: 'Session expirée.' }, { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json(
        { ok: false, message: 'Seul un super administrateur peut créer un administrateur.' },
        { status: 403 }
      );
    }
    console.error('Create admin user error:', error);
    return NextResponse.json({ ok: false, message: 'Impossible de créer l’administrateur.' }, { status: 500 });
  }
}
