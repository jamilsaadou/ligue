const CSRF_TTL_SECONDS = 60 * 60 * 24;

export const CSRF_COOKIE_NAME = 'av_csrf';

const toBase64Url = (input: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < input.length; i += 1) {
    binary += String.fromCharCode(input[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const generateCsrfToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

export const getCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: CSRF_TTL_SECONDS
});
