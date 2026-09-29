import type { GetTariffs } from '../LandingPage.deps'
import type { LandingTariffs } from '../LandingPage.types'

export type TariffsFetcher = (
  url: string,
  options: { query: { currency: string } },
) => Promise<unknown>

// Reads the prices from this app's own `/landing/tariffs` route (see `server/routes/landing`),
// on the server while rendering and in the browser when the currency is switched.
export const createFetchTariffs =
  (fetcher: TariffsFetcher): GetTariffs =>
  async (currency) => {
    try {
      const data = (await fetcher('/landing/tariffs', { query: { currency } })) as LandingTariffs
      return { data, status: 'success' }
    } catch (cause) {
      return { code: (cause as { statusCode?: number }).statusCode ?? 0, status: 'error' }
    }
  }
