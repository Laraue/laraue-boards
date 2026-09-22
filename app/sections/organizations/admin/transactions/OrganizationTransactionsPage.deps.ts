import type { QueryResult } from '#infrastructure/api/apiResult'

import type { OrganizationTransactionsPageData } from './OrganizationTransactionsPage.types'

export type OrganizationTransactionsPageDeps = {
  view: (input: {
    page: number
    signal?: AbortSignal
    userId?: string
  }) => Promise<QueryResult<OrganizationTransactionsPageData>>
}
