import type { QueryResult } from '#infrastructure/api/apiResult'

import type { UserTransactionsPageData } from './UserTransactionsPage.types'

export type UserTransactionsPageDeps = {
  view: (input: {
    page: number
    signal?: AbortSignal
  }) => Promise<QueryResult<UserTransactionsPageData>>
}
