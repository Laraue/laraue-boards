import type { QueryResult } from '#infrastructure/api/apiResult'

import type { BillingPageData } from './BillingPage.types'

export type BillingPageDeps = {
  view: (input: { signal?: AbortSignal }) => Promise<QueryResult<BillingPageData>>
}
