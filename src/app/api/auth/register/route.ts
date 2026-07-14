import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions
} from '@/lib/auth';

type RegisterPayload = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  let payload: RegisterPayload | null = null;

  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    payload = null;
  }

  const email = payload?.email?.trim().toLowerCase() ?? '';
  const password = payload?.password ?? '';
  const name = payload?.name?.trim() || null;

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: 'Email et mot de passe requis.' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'Un compte existe déjà avec cet email.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'user'
      }
    });

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({ ok: true, role: user.role });
    response.cookies.set(
      getSessionCookieName(),
      token,
      getSessionCookieOptions()
    );
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur. Réessayez.' },
      { status: 500 }
    );
  }
}
