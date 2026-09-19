import type { QueryResult } from '#infrastructure/api/apiResult'

import type { BillingTransactionsPageData } from './BillingTransactionsPage.types'

export type BillingTransactionsPageDeps = {
  view: (input: {
    page: number
    signal?: AbortSignal
    userId?: string
  }) => Promise<QueryResult<BillingTransactionsPageData>>
}
