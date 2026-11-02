import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { UserTransactionsPageDeps } from './UserTransactionsPage.deps'

export const createTransactionsPageDeps = (client: ApiClient): UserTransactionsPageDeps => ({
  view: async ({ page, signal }) => {
    const result = await request(
      client.POST('/api/billing/transactions', {
        body: { pagination: { page: page - 1, perPage: 20 } },
        signal,
      }),
    )
    return {
      hasNextPage: result.hasNextPage,
      transactions: result.data.map((transaction) => ({
        createdAt: transaction.createdAt,
        delta: transaction.delta,
        error: transaction.error,
        finishedAt: transaction.finishedAt,
        id: transaction.id,
        ownerName: null,
        reason: transaction.reason,
        status: transaction.status,
      })),
    }
  },
})
