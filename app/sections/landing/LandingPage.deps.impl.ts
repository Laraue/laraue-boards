import { ApiError } from '#infrastructure/api/request'

import type { LandingPageDeps, LandingTariffs } from './LandingPage.deps'

export type TariffsFetcher = (url: string) => Promise<unknown>

// Reads the prices from this app's own `/landing/tariffs` route (see `server/routes/landing`),
// on the server while rendering. Billing prices them in the currency it charges in.
export const createLandingPageDeps = (fetcher: TariffsFetcher): LandingPageDeps => ({
  getTariffs: async () => {
    try {
      return (await fetcher('/landing/tariffs')) as LandingTariffs
    } catch (cause) {
      throw new ApiError((cause as { statusCode?: number }).statusCode ?? 0)
    }
  },
})
