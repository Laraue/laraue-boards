import { useGtag } from '#imports'
import { consentStorageKey, detectCountryCode } from '#layers/core/app/analytics/consent/decision'

import type { ConsentControllerDeps } from './ConsentController.deps'

export const createConsentControllerDeps = (): ConsentControllerDeps => {
  const { gtag, initialize } = useGtag()
  return {
    detectCountryCode: () => detectCountryCode(globalThis.fetch, globalThis.location.hostname),
    initializeAnalytics: () => initialize(),
    readStoredChoice: () => {
      try {
        return localStorage.getItem(consentStorageKey)
      } catch {
        // A blocked browser store leaves the visitor's choice unresolved.
        return null
      }
    },
    saveChoice: (choice) => {
      try {
        localStorage.setItem(consentStorageKey, choice)
      } catch {
        /* The choice still applies for this visit when storage is blocked. */
      }
    },
    setAnalyticsConsent: (choice) => gtag('consent', 'update', { analytics_storage: choice }),
  }
}
