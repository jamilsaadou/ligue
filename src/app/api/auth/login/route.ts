import { NextResponse } from 'next/server';
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
  verifyCredentials
} from '@/lib/auth';

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let payload: LoginPayload | null = null;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    payload = null;
  }

  const email = payload?.email?.trim() ?? '';
  const password = payload?.password ?? '';

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: 'Email et mot de passe requis.' },
      { status: 400 }
    );
  }

  try {
    const result = await verifyCredentials(email, password);

    if (!result) {
      return NextResponse.json(
        { ok: false, message: 'Identifiants invalides.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(result.email, result.role);
    const response = NextResponse.json({ ok: true, role: result.role });
    response.cookies.set(
      getSessionCookieName(),
      token,
      getSessionCookieOptions()
    );
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur. Réessayez.' },
      { status: 500 }
    );
  }
}
