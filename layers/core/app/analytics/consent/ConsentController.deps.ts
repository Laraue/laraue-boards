import type { ConsentChoice } from '#layers/core/app/analytics/consent/decision'

export type ConsentControllerDeps = {
  detectCountryCode: () => Promise<null | string>
  initializeAnalytics: () => void
  readStoredChoice: () => null | string
  saveChoice: (choice: ConsentChoice) => void
  setAnalyticsConsent: (choice: ConsentChoice) => void
}
