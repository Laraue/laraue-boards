export type ConsentChoice = 'denied' | 'granted'

export type ConsentDecision = {
  // The visitor's choice; `null` until they have decided (only when consent is required).
  consent: ConsentChoice | null
  // Whether the visitor's country requires asking before analytics may run.
  required: boolean
}

export const consentStorageKey = 'cookie-consent'

// EU member states + EEA (Iceland, Liechtenstein, Norway) + UK (UK GDPR) + Switzerland (FADP, GDPR-like)
const consentRequiredCountries = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'IS',
  'LI',
  'NO',
  'GB',
  'CH',
])

// Countries where Google Analytics must not be used at all, consent or not - e.g. Russia, where the
// law forbids using foreign analytics services on Russian users. Visitors from these countries
// never load the Google tag and never see the cookie banner.
const analyticsBlockedCountries = new Set(['RU'])

// Fails safe: an unresolved country (no answer from Cloudflare, e.g. in local development) is
// treated as requiring consent.
export const isConsentRequiredCountry = (countryCode?: null | string): boolean =>
  !countryCode || consentRequiredCountries.has(countryCode.toUpperCase())

// An unresolved country is not treated as blocked: it falls back to asking for consent, so analytics
// still only runs after the visitor accepts it.
export const isAnalyticsBlockedCountry = (countryCode?: null | string): boolean =>
  !!countryCode && analyticsBlockedCountries.has(countryCode.toUpperCase())

// Analytics and its consent banner belong to the public content pages only: the landing page and the
// documentation, in either language. The app (login, account, boards) has neither.
export const isConsentPage = (path: string): boolean =>
  path === '/' ||
  path === '/ru' ||
  ['/en/documentation', '/ru/documentation'].some(
    (documentation) => path === documentation || path.startsWith(`${documentation}/`),
  )

export const parseTraceCountry = (trace: string): null | string =>
  /^loc=([A-Z]{2})$/m.exec(trace)?.[1] ?? null

// The visitor's country from Cloudflare's `/cdn-cgi/trace`, which Cloudflare answers at the edge for
// every proxied domain. `null` when it can't be resolved.
export const detectCountryCode = async (
  fetcher: typeof globalThis.fetch = globalThis.fetch,
): Promise<null | string> => {
  try {
    const response = await fetcher('/cdn-cgi/trace', { cache: 'no-store' })
    return response.ok ? parseTraceCountry(await response.text()) : null
  } catch {
    return null
  }
}

export const decideConsent = (
  countryCode: null | string,
  stored: null | string,
): ConsentDecision => {
  if (isAnalyticsBlockedCountry(countryCode)) {
    return { consent: 'denied', required: false }
  }
  if (!isConsentRequiredCountry(countryCode)) {
    return { consent: 'granted', required: false }
  }

  return { consent: stored === 'granted' || stored === 'denied' ? stored : null, required: true }
}
