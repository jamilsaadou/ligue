import { getSessionCookieName, verifySessionToken } from '@/lib/auth';

export type ClientContext = {
  sessionId?: string | null;
  referrer?: string | null;
  deviceName?: string | null;
  userAgent?: string | null;
  language?: string | null;
  screen?: string | null;
  timezone?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

const clip = (value: unknown, max = 255) =>
  typeof value === 'string' && value.trim()
    ? value.trim().slice(0, max)
    : null;

export const getRequestSession = (request: Request) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getSessionCookieName()}=`));
  const token = tokenMatch ? tokenMatch.slice(tokenMatch.indexOf('=') + 1) : null;
  return verifySessionToken(token);
};

export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return clip(forwarded.split(',')[0]);
  return clip(
    request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-client-ip')
  );
};

export const getClientLocation = (request: Request) => ({
  country: clip(
    request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country-code')
  ),
  city: clip(
    request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity')
  )
});

export const parseUserAgent = (userAgentValue: unknown) => {
  const userAgent = clip(userAgentValue, 1000) || '';
  let browser = 'Autre';
  if (/Edg\//i.test(userAgent)) browser = 'Edge';
  else if (/OPR\//i.test(userAgent)) browser = 'Opera';
  else if (/Chrome\//i.test(userAgent)) browser = 'Chrome';
  else if (/Firefox\//i.test(userAgent)) browser = 'Firefox';
  else if (/Safari\//i.test(userAgent)) browser = 'Safari';

  let os = 'Autre';
  if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
  else if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = 'macOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  let deviceType = 'Ordinateur';
  if (/iPad|Tablet/i.test(userAgent)) deviceType = 'Tablette';
  else if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) deviceType = 'Mobile';

  return { userAgent: userAgent || null, browser, os, deviceType };
};

export const normalizeClientContext = (request: Request, context: ClientContext) => {
  const parsed = parseUserAgent(
    context.userAgent || request.headers.get('user-agent') || ''
  );
  const location = getClientLocation(request);
  return {
    sessionId: clip(context.sessionId),
    referrer: clip(context.referrer, 1000),
    deviceName: clip(context.deviceName),
    userAgent: parsed.userAgent,
    browser: parsed.browser,
    os: parsed.os,
    deviceType: parsed.deviceType,
    language: clip(context.language, 32),
    screen: clip(context.screen, 32),
    timezone: clip(context.timezone, 100),
    utmSource: clip(context.utmSource),
    utmMedium: clip(context.utmMedium),
    utmCampaign: clip(context.utmCampaign),
    ...location
  };
};
