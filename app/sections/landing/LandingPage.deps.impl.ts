import { ApiError } from '#infrastructure/api/request'

import type { LandingPageDeps, LandingTariffs } from './LandingPage.deps'

export type TariffsFetcher = (
  url: string,
  options: { query: { currency: string } },
) => Promise<unknown>

// Reads the prices from this app's own `/landing/tariffs` route (see `server/routes/landing`),
// on the server while rendering and in the browser when the currency is switched.
export const createLandingPageDeps = (fetcher: TariffsFetcher): LandingPageDeps => ({
  getTariffs: async (currency) => {
    try {
      return (await fetcher('/landing/tariffs', { query: { currency } })) as LandingTariffs
    } catch (cause) {
      throw new ApiError((cause as { statusCode?: number }).statusCode ?? 0)
    }
  },
})
