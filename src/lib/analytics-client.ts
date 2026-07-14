const SESSION_STORAGE_KEY = 'av_tracking_session';
const CAMPAIGN_STORAGE_KEY = 'av_tracking_campaign';

export type AnalyticsMetadata = Record<
  string,
  string | number | boolean | null | undefined
>;

export type AnalyticsPayload = {
  eventName: string;
  eventCategory?: string;
  path?: string;
  durationMs?: number;
  diagnosticId?: string;
  attemptId?: string;
  metadata?: AnalyticsMetadata;
};

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: { platform?: string; mobile?: boolean };
};

export const getAnalyticsSessionId = () => {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
};

const getCampaign = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const campaign = {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined
  };

  if (campaign.utmSource || campaign.utmMedium || campaign.utmCampaign) {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign));
    return campaign;
  }

  try {
    return JSON.parse(localStorage.getItem(CAMPAIGN_STORAGE_KEY) || '{}') as typeof campaign;
  } catch {
    return {};
  }
};

export const getClientAnalyticsContext = () => {
  if (typeof window === 'undefined') return {};
  const extendedNavigator = navigator as NavigatorWithUserAgentData;
  return {
    sessionId: getAnalyticsSessionId(),
    referrer: document.referrer || undefined,
    deviceName:
      extendedNavigator.userAgentData?.platform || navigator.platform || undefined,
    userAgent: navigator.userAgent || undefined,
    language: navigator.language || undefined,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
    ...getCampaign()
  };
};

export const sendAnalyticsEvent = (
  payload: AnalyticsPayload,
  options?: { beacon?: boolean }
) => {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({
    ...getClientAnalyticsContext(),
    ...payload,
    path: payload.path || window.location.pathname
  });

  if (options?.beacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    return;
  }

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => undefined);
};
