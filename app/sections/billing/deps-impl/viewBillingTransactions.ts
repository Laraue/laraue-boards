import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { BillingTransactionsPageDeps } from '../BillingTransactionsPage.deps'

export const createViewBillingTransactions =
  (client: ApiClient): BillingTransactionsPageDeps['view'] =>
  ({ page, signal }) =>
    executeQuery({
      map: (result) => {
        if (!result) {
          return undefined
        }
        return {
          hasNextPage: result.hasNextPage,
          members: [],
          transactions: result.data.map((transaction) => ({
            createdAt: transaction.createdAt,
            delta: Number(transaction.delta),
            error: transaction.error ?? null,
            finishedAt: transaction.finishedAt ?? null,
            id: transaction.id,
            ownerName: null,
            reason: transaction.reason,
            status: transaction.status,
          })),
        }
      },
      request: () =>
        client.POST('/api/billing/transactions', {
          body: { pagination: { page: page - 1, perPage: 20 } },
          signal,
        }),
    })
