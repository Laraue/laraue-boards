import type { BillingApiClient } from '#infrastructure/api/client'

import type { LandingPageDeps } from '../LandingPage.deps'
import { createGetTariffs } from './getTariffs'

export const createLandingPageDeps = (client: BillingApiClient): LandingPageDeps => ({
  getTariffs: createGetTariffs(client),
})
