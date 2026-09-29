import type { ConsentChoice } from '~/utils/consent'

// The visitor's analytics consent. `resolved` turns true once the visitor's country is known and the
// stored choice has been read; until then no banner is shown and no analytics runs.
export type ConsentState = {
  consent: ConsentChoice | null
  required: boolean
  resolved: boolean
}

export const useConsent = () =>
  useState<ConsentState>('consent', () => ({ consent: null, required: true, resolved: false }))
