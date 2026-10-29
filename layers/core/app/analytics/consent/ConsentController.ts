import type { ConsentChoice } from '#layers/core/app/analytics/consent/decision'
import { decideConsent, isConsentPage } from '#layers/core/app/analytics/consent/decision'

import type { ConsentControllerDeps } from './ConsentController.deps'

export const createConsentController = (deps: ConsentControllerDeps) => {
  let initialized = false

  return {
    apply: (consent: ConsentChoice | null, path: string): void => {
      if (consent === 'granted' && isConsentPage(path)) {
        deps.setAnalyticsConsent('granted')
        if (!initialized) {
          deps.initializeAnalytics()
          initialized = true
        }
      } else if (initialized) {
        deps.setAnalyticsConsent('denied')
      }
    },
    resolve: async () => decideConsent(await deps.detectCountryCode(), deps.readStoredChoice()),
  }
}
