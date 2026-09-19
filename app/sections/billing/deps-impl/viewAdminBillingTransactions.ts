import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { BillingTransactionsPageDeps } from '../BillingTransactionsPage.deps'

type Schemas = components['schemas']

const loadMembers = (client: ApiClient, signal: AbortSignal | undefined) =>
  executeQuery({
    map: (members: Schemas['OrganizationMember'][]) =>
      members.map((member) => ({ id: member.userId, name: member.displayName })),
    request: () => client.GET('/api/admin/organizations/members', { signal }),
  })

export const createViewAdminBillingTransactions =
  (client: ApiClient): BillingTransactionsPageDeps['view'] =>
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
              reason: transaction.reason,
              status: transaction.status,
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
    return {
      data: {
        ...transactions.data,
        members: members.data,
      },
      status: 'success',
    }
  }
