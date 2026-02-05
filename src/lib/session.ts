import { shouldUseSecureCookies } from './cookie-flags';

export type UserRole = 'admin' | 'user';

type SessionPayload = {
  email: string;
  role: UserRole;
  exp: number;
};

export const SESSION_COOKIE_NAME = 'av_session';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_ROTATE_THRESHOLD_SECONDS = 60 * 60 * 24;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not set');
  }
  return secret;
};

const toBase64Url = (input: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < input.length; i += 1) {
    binary += String.fromCharCode(input[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const fromBase64Url = (input: string) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = padded.length % 4 ? 4 - (padded.length % 4) : 0;
  const normalized = padded + '='.repeat(padLength);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return decoder.decode(bytes);
};

const concatBytes = (a: Uint8Array, b: Uint8Array) => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
};

const rotr = (value: number, shift: number) =>
  (value >>> shift) | (value << (32 - shift));

const sha256 = (data: Uint8Array) => {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLength = data.length * 8;
  const withOne = data.length + 1;
  const padLength = ((withOne + 8 + 63) & ~63) - withOne;
  const totalLength = withOne + padLength + 8;
  const buffer = new Uint8Array(totalLength);
  buffer.set(data, 0);
  buffer[data.length] = 0x80;

  const view = new DataView(buffer.buffer);
  view.setUint32(totalLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(totalLength - 4, bitLength >>> 0);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < buffer.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4);
    }

    for (let i = 16; i < 64; i += 1) {
      const s0 =
        rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 =
        rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0);
  outView.setUint32(4, h1);
  outView.setUint32(8, h2);
  outView.setUint32(12, h3);
  outView.setUint32(16, h4);
  outView.setUint32(20, h5);
  outView.setUint32(24, h6);
  outView.setUint32(28, h7);
  return out;
};

const hmacSha256 = (key: Uint8Array, data: Uint8Array) => {
  const blockSize = 64;
  let normalizedKey = key;

  if (normalizedKey.length > blockSize) {
    normalizedKey = sha256(normalizedKey);
  }

  if (normalizedKey.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(normalizedKey);
    normalizedKey = padded;
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i += 1) {
    const value = normalizedKey[i];
    oKeyPad[i] = value ^ 0x5c;
    iKeyPad[i] = value ^ 0x36;
  }

  const inner = sha256(concatBytes(iKeyPad, data));
  return sha256(concatBytes(oKeyPad, inner));
};

const sign = (value: string) => {
  const key = encoder.encode(getSessionSecret());
  const signature = hmacSha256(key, encoder.encode(value));
  return toBase64Url(signature);
};

export const createSessionToken = (email: string, role: UserRole) => {
  const payload: SessionPayload = {
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = sign(body);
  return `${body}.${signature}`;
};

export const readSessionToken = (token: string | undefined | null) => {
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

export const shouldRotateSession = (payload: SessionPayload) => {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now < SESSION_ROTATE_THRESHOLD_SECONDS;
};

export const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: shouldUseSecureCookies(),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS
});
