import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { OrganizationTransactionsPageDeps } from '../OrganizationTransactionsPage.deps'
import type { TransactionReason, TransactionStatus } from '../OrganizationTransactionsPage.types'

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

const loadMembers = (client: ApiClient, signal: AbortSignal | undefined) =>
  executeQuery({
    map: (members: Schemas['OrganizationMember'][]) =>
      members.map((member) => ({ id: member.userId, name: member.displayName })),
    request: () => client.GET('/api/admin/organizations/members', { signal }),
  })

export const createViewTransactions =
  (client: ApiClient): OrganizationTransactionsPageDeps['view'] =>
  async ({ page, signal, userId }) => {
    const [transactions, members] = await Promise.all([
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
              ownerName: transaction.ownerDisplayName ?? transaction.ownerUserId,
              reason: reasonMap[transaction.reason],
              status: statusMap[transaction.status],
            })),
          }
        },
        request: () =>
          client.POST('/api/admin/organizations/billing/transactions', {
            body: {
              ...(userId ? { userId } : {}),
              pagination: { page: page - 1, perPage: 20 },
            },
            signal,
          }),
      }),
      loadMembers(client, signal),
    ])

    if (transactions.status === 'error') {
      return transactions
    }
    if (members.status === 'error') {
      return members
    }
    const memberNames = new Map(members.data.map((member) => [member.id, member.name]))
    return {
      data: {
        ...transactions.data,
        members: members.data,
        transactions: transactions.data.transactions.map((transaction) => ({
          ...transaction,
          ownerName: memberNames.get(transaction.ownerName) ?? transaction.ownerName,
        })),
      },
      status: 'success',
    }
  }
