import type { LandingPageDeps } from '../LandingPage.deps'
import { createGetTariffs } from './getTariffs'

export const createLandingPageDeps = (billingApiBaseUrl: string): LandingPageDeps => ({
  getTariffs: createGetTariffs(billingApiBaseUrl),
})
