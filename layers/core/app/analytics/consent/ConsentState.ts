import type { ConsentChoice } from '#layers/core/app/analytics/consent/decision'

export type ConsentState = {
  consent: ConsentChoice | null
  required: boolean
  resolved: boolean
}
