import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { UserTransactionsPageDeps } from '../UserTransactionsPage.deps'
import type { TransactionReason, TransactionStatus } from '../UserTransactionsPage.types'

type Schemas = components['schemas']

const reasonMap = {
  DailyGrant: 'DailyGrant',
  Expiry: 'Expiry',
  Purchase: 'Purchase',
  Spend: 'Spend',
  TariffGrant: 'TariffGrant',
} satisfies Record<Schemas['TokenTransactionReason'], TransactionReason>

const statusMap = {
  Canceled: 'Canceled',
  Confirmed: 'Confirmed',
  Started: 'Started',
} satisfies Record<Schemas['TokenTransactionStatus'], TransactionStatus>

export const createViewTransactions =
  (client: ApiClient): UserTransactionsPageDeps['view'] =>
  ({ page, signal }) =>
    executeQuery({
      map: (result) => {
        if (!result) {
          return undefined
        }
        return {
          hasNextPage: result.hasNextPage,
          transactions: result.data.map((transaction) => ({
            createdAt: transaction.createdAt,
            delta: Number(transaction.delta),
            error: transaction.error ?? null,
            finishedAt: transaction.finishedAt ?? null,
            id: transaction.id,
            ownerName: null,
            reason: reasonMap[transaction.reason],
            status: statusMap[transaction.status],
          })),
        }
      },
      request: () =>
        client.POST('/api/billing/transactions', {
          body: { pagination: { page: page - 1, perPage: 20 } },
          signal,
        }),
    })
