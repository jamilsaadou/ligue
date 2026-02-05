import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { RowDataPacket } from 'mysql2';
import { pool } from './db';

export type UserRole = 'admin' | 'user';

const SESSION_COOKIE = 'av_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
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

export const createSessionToken = (email: string, role: UserRole) => {
  const payload: SessionPayload = {
    email,
    role,
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
  return verifySessionToken(token);
};

export const getSessionCookieName = () => SESSION_COOKIE;

export const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS
});

type UserRow = RowDataPacket & {
  email: string;
  password_hash?: string | null;
  password?: string | null;
  role?: string | null;
};

type AuthResult = {
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
      return { email: normalizedEmail, role: 'admin' as const };
    }
  }

  const [rows] = await pool.query<UserRow[]>(
    'SELECT email, password_hash, password, role FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  const user = rows[0];
  if (!user) return null;

  const storedPassword = user.password_hash || user.password;
  if (!storedPassword) return null;

  const valid = await matchPassword(password, storedPassword);
  if (!valid) return null;

  const role: UserRole = user.role === 'admin' ? 'admin' : 'user';
  return { email: user.email, role };
};
