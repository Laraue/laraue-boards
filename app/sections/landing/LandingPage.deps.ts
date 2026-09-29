import type { QueryResult } from '#infrastructure/api/apiResult'

import type { LandingCurrency, LandingTariffs } from './LandingPage.types'

export type GetTariffs = (currency: LandingCurrency) => Promise<QueryResult<LandingTariffs>>

export type LandingPageDeps = {
  getTariffs: GetTariffs
}
