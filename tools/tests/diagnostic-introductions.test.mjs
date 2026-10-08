import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname = path.dirname(fileURLToPath(import.meta.url));
import vm from 'node:vm';
import ts from 'typescript';

function load(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(dirname, '../../', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => {
    if (name in dependencies) return dependencies[name];
    throw new Error(`Unexpected dependency: ${name}`);
  }, console, Request, Date, Math });
  return exports;
}

const content = load('src/data/category-introductions.ts');
const analytics = load('src/lib/analytics-server.ts', {
  '@/lib/auth': { getSessionCookieName: () => 'session', verifySessionToken: () => ({ id: 'signed-in-user' }) }
});

test('all eight definitions resolve, including accented names and existing category aliases', () => {
  assert.equal(content.categoryIntroductions.length, 8);
  for (const category of content.categoryIntroductions) {
    assert.equal(content.getCategoryDefinition(category.title), category.definition);
  }
  assert.equal(content.getCategoryDefinition('Cyberviolences'), content.categoryIntroductions[1].definition);
  assert.equal(content.getCategoryDefinition('Autre catégorie', 'Description existante'), 'Description existante');
});

test('diagnostic titles resolve to the supplied definitions before generic category aliases', () => {
  for (const [title, definitionTitle] of [
    ['Cyber-Violentoscope', 'Cyberviolences'],
    ['Harcélomètre', 'Harcèlement'],
    ['Haromètre économique', 'Violences économiques'],
    ['Baromètre des violences économiques', 'Violences économiques'],
    ['Incestomètre', 'Climat incestuel'],
    ['Climat incestuel', 'Climat incestuel'],
    ['Violentomètre - Évaluez votre relation', 'Violences'],
  ]) {
    const expected = content.diagnosticDefinitions.find((item) => item.title === definitionTitle).definition;
    assert.equal(content.getDiagnosticDefinition(title), expected, title);
    assert.equal(content.getCategoryDefinition(title), expected, title);
  }
  assert.equal(content.getDiagnosticDefinition('Diagnostic personnalisé'), undefined);
  assert.equal(content.getDiagnosticDefinition('Violences psychologiques'), undefined);
  assert.notEqual(content.getCategoryDefinition('Inceste'), content.getCategoryDefinition('Climat incestuel'));
});

test('diagnostic context removes identifying and shared browsing fields', () => {
  const context = analytics.anonymousDiagnosticContext(new Request('http://localhost', {
    headers: { 'user-agent': 'Test browser', 'x-vercel-ip-city': 'Test City', 'x-vercel-ip-country': 'NE' }
  }), { sessionId: 'shared-session', referrer: 'https://example.com/profile', deviceName: 'personal-device' });
  for (const key of ['sessionId', 'referrer', 'deviceName', 'userAgent', 'city', 'screen', 'timezone', 'utmSource']) {
    assert.equal(context[key], null, key);
  }
  assert.equal(context.country, 'NE');
});

for (const route of ['attempt', 'submit', 'track']) {
  test(`${route} writes no account or shared session link even with an authenticated request`, async () => {
    const writes = [];
    const record = async (args) => { writes.push(args.data); return { id: 'new-record', createdAt: new Date(), count: 1 }; };
    const prisma = {
      diagnostic: { findUnique: async () => ({ id: 'diagnostic-id', title: 'Test' }) },
      diagnosticAttempt: { findUnique: async () => null, create: record, upsert: async (args) => { writes.push(args.update); return record({ data: args.create }); }, updateMany: async () => ({ count: 1 }) },
      diagnosticSubmission: { findUnique: async () => null, create: record },
      trackingEvent: { create: record, deleteMany: async () => ({ count: 0 }) },
      setting: { findUnique: async () => null },
    };
    prisma.$transaction = (operation) => typeof operation === 'function' ? operation(prisma) : Promise.all(operation);
    const handlers = load(`src/app/api/${route === 'track' ? 'track' : 'diagnostic/' + route}/route.ts`, {
      'next/server': { NextResponse: { json: (body) => body } },
      '@prisma/client': {},
      '@/lib/prisma': { prisma },
      '@/lib/analytics-server': analytics,
      '@/lib/mailer': { sendDiagnosticNotification: async (notification) => { assert.equal(notification.anonymous, true); return { sent: false }; } },
    });
    const payload = { path: '/diagnostic', eventName: 'diagnostic_started', eventCategory: 'diagnostic', diagnosticId: 'diagnostic-id', attemptId: 'attempt-id', mode: 'self', totalQuestions: 2, answersCount: 1, answers: { q1: 0 }, level: 'safe', sessionId: 'shared-session', milestone: 50 };
    const request = () => new Request('http://localhost', { method: 'POST', headers: { cookie: 'session=authenticated', 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' }, body: JSON.stringify(payload) });
    assert.equal((await handlers.POST(request())).ok, true);
    if (handlers.PATCH) assert.equal((await handlers.PATCH(request())).ok, true);
    assert.ok(writes.length > 0);
    for (const row of writes) {
      assert.equal(row.userId, null);
      assert.equal(row.sessionId, null);
      if ('ip' in row) assert.equal(row.ip, null);
    }
  });
}
