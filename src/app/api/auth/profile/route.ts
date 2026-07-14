import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { submissions: true, attempts: true } },
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            totalScore: true,
            maxScore: true,
            level: true,
            createdAt: true,
            diagnostic: { select: { title: true } }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ ok: false, message: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: 'Non autorisé.' }, { status: 401 });
    }

    const payload = await request.json();
    const { name, currentPassword, newPassword } = payload;

    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    const updateData: { name?: string; passwordHash?: string } = {};

    // Update name if provided
    if (name !== undefined) {
      updateData.name = name?.trim() || null;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { ok: false, message: 'Le mot de passe actuel est requis.' },
          { status: 400 }
        );
      }

      const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!validPassword) {
        return NextResponse.json(
          { ok: false, message: 'Le mot de passe actuel est incorrect.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { ok: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: true, message: 'Aucune modification.' });
    }

    await prisma.user.update({
      where: { id: session.id },
      data: updateData
    });

    return NextResponse.json({ ok: true, message: 'Profil mis à jour avec succès.' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ ok: false, message: 'Erreur serveur.' }, { status: 500 });
  }
}
