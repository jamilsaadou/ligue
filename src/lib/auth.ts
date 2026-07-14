import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { shouldUseSecureCookies } from './cookie-flags';
import { prisma } from './prisma';

export type UserRole = 'super_admin' | 'admin' | 'user';

const SESSION_COOKIE = 'av_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  id: string;
  email: string;
  role: UserRole;
  exp: number;
};

const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not set');
  }
  return secret;
};

const toBase64Url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const fromBase64Url = (input: string) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = padded.length % 4 ? 4 - (padded.length % 4) : 0;
  const normalized = padded + '='.repeat(padLength);
  return Buffer.from(normalized, 'base64').toString('utf-8');
};

const sign = (value: string) => {
  const secret = getSessionSecret();
  return toBase64Url(
    crypto.createHmac('sha256', secret).update(value).digest()
  );
};

export const createSessionToken = (user: {
  id: string;
  email: string;
  role: UserRole;
}) => {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
};

export const verifySessionToken = (token: string | undefined | null) => {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  if (sign(body) !== signature) return null;
  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const getSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { email: true, role: true, isActive: true, adminModules: true }
  });

  if (!user?.isActive) return null;

  return {
    ...session,
    email: user.email,
    role: user.role,
    adminModules: user.adminModules
  };
};

export const getSessionCookieName = () => SESSION_COOKIE;

export const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: shouldUseSecureCookies(),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS
});

type AuthResult = {
  id: string;
  email: string;
  role: UserRole;
};

const isBcryptHash = (value: string) =>
  value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');

const matchPassword = async (input: string, stored: string) => {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(input, stored);
  }
  return input === stored;
};

export const verifyCredentials = async (
  email: string,
  password: string
): Promise<AuthResult | null> => {
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (adminEmail && adminPassword && normalizedEmail === adminEmail) {
    const validAdminPassword = await matchPassword(password, adminPassword);
    if (validAdminPassword) {
      const passwordHash = isBcryptHash(adminPassword)
        ? adminPassword
        : await bcrypt.hash(adminPassword, 10);
      const admin = await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          role: 'super_admin',
          passwordHash,
          isActive: true
        },
        create: {
          email: normalizedEmail,
          passwordHash,
          role: 'super_admin'
        }
      });
      return { id: admin.id, email: admin.email, role: admin.role };
    }
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (!user?.isActive) return null;

  const valid = await matchPassword(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, email: user.email, role: user.role };
};
