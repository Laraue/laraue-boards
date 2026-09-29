import type { LandingPageDeps } from '../LandingPage.deps'
import type { TariffsFetcher } from './fetchTariffs'
import { createFetchTariffs } from './fetchTariffs'

export const createLandingPageDeps = (fetcher: TariffsFetcher): LandingPageDeps => ({
  getTariffs: createFetchTariffs(fetcher),
})
