import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { canAuthenticate, isPublicAuthEnabled } from './public-auth';
import { POST as login } from '../app/api/auth/login/route';
import { POST as register } from '../app/api/auth/register/route';

// Stub all database access; these tests never create accounts or change settings.
test('public authentication policy and API enforcement', async (t) => {
  const stub = (target: object, key: string, implementation: (...args: unknown[]) => unknown) => {
    const object = target as Record<string, unknown>;
    const original = object[key];
    object[key] = implementation;
    t.after(() => { object[key] = original; });
  };
  let enabled: unknown = false;
  let role: 'user' | 'admin' | 'super_admin' = 'user';
  let passwordValid = true;
  let created = 0;
  let updated = 0;
  let existingUser = true;
  const originalSecret = process.env.SESSION_SECRET;
  const originalAdmin = process.env.SUPER_ADMIN_EMAIL;
  process.env.SESSION_SECRET = 'test-only-public-auth-session-secret';
  delete process.env.SUPER_ADMIN_EMAIL;
  t.after(() => {
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
    if (originalAdmin === undefined) delete process.env.SUPER_ADMIN_EMAIL;
    else process.env.SUPER_ADMIN_EMAIL = originalAdmin;
    t.mock.restoreAll();
  });
  stub(prisma.setting, 'findUnique', async () => enabled === undefined ? null : { value: enabled });
  stub(prisma.user, 'findUnique', async () => existingUser ? {
    id: 'test-user', email: 'test@example.invalid', role, isActive: true, passwordHash: '$2b$test-hash'
  } : null);
  t.mock.method(bcrypt, 'compare', async () => passwordValid);
  stub(prisma.user, 'update', async () => { updated++; return {}; });
  stub(prisma.user, 'create', async () => { created++; return { id: 'new-user', email: 'new@example.invalid', role: 'user' }; });
  const request = () => new Request('http://localhost/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.invalid', password: 'test-password' })
  });

  await t.test('missing, false and malformed settings deny public access', async () => {
    for (const value of [undefined, false, 'true', 1]) {
      enabled = value;
      assert.equal(await isPublicAuthEnabled(), false);
      assert.equal(await canAuthenticate('user'), false);
      assert.equal(await canAuthenticate('admin'), true);
      assert.equal(await canAuthenticate('super_admin'), true);
    }
  });
  await t.test('closed mode rejects user login without creating a session or changing last login', async () => {
    enabled = false; role = 'user';
    const response = await login(request());
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(updated, 0);
  });
  await t.test('closed mode rejects direct registration without creating an account', async () => {
    const response = await register(request());
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(created, 0);
  });
  await t.test('both administrator roles can log in while public access is closed', async () => {
    for (const adminRole of ['admin', 'super_admin'] as const) {
      role = adminRole;
      const response = await login(request());
      assert.equal(response.status, 200);
      assert.match(response.headers.get('set-cookie') || '', /av_session=/);
    }
  });
  await t.test('administrator access still requires a valid password', async () => {
    passwordValid = false;
    const response = await login(request());
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('set-cookie'), null);
    passwordValid = true;
  });
  await t.test('open mode allows user login and registration', async () => {
    enabled = true; role = 'user';
    assert.equal((await login(request())).status, 200);
    existingUser = false;
    const response = await register(request());
    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie') || '', /av_session=/);
    assert.equal(created, 1);
  });
});
