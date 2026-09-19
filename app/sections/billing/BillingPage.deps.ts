import type { QueryResult } from '#infrastructure/api/apiResult'

import type { BillingPageData } from './BillingPage.types'
import type { BillingTransactionsPageDeps } from './BillingTransactionsPage.deps'

export type BillingPageDeps = {
  adminTransactions: BillingTransactionsPageDeps
  transactions: BillingTransactionsPageDeps
  view: (input: { signal?: AbortSignal }) => Promise<QueryResult<BillingPageData>>
}
